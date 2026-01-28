/**
 * Messages chat UI. Chat log updates only from socket events
 * (chat:message, chat:reply) so all browsers/tabs stay in sync. POST to
 * /api/messages/chat does not update the UI — we wait for the socket.
 */
(function () {
  const messagesArea = document.getElementById('messagesArea');
  const messageInput = document.getElementById('messageInput');
  const sendBtn = document.getElementById('sendMessageBtn');

  if (!messagesArea || !messageInput || !sendBtn) return;

  var shownIds = Object.create(null);
  var lastMessageCreatedAt = null;
  var pollingIntervalId = null;

  function markShown(id) {
    if (id !== null) shownIds[String(id)] = true;
  }

  function alreadyShown(id) {
    return id !== null && shownIds[String(id)];
  }

  function renderMessage(content, kind, createdAt, id) {
    if (id !== null) markShown(id);
    var time = createdAt
      ? new Date(createdAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';
    var div = document.createElement('div');
    div.className = 'message ' + (kind === 'sent' ? 'sent' : 'received');
    var safeContent = (content || '')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    var deleteButtonHtml = '';
    if (id) {
      // Use Materialize trash icon; visibility is controlled via CSS hover
      deleteButtonHtml =
        '<button type="button" class="delete-message-btn" aria-label="Delete message" title="Delete message">' +
        '<i class="material-icons">delete</i>' +
        '</button>';
    }

    div.innerHTML =
      (time ? '<div class="message-time">' + time + '</div>' : '') +
      '<span class="message-text">' +
      safeContent +
      '</span>' +
      deleteButtonHtml;

    messagesArea.appendChild(div);
    messagesArea.scrollTop = messagesArea.scrollHeight;

    if (id) {
      var btn = div.querySelector('.delete-message-btn');
      if (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          if (
            !confirm(
              'Remove this message from your chat history? This cannot be undone.'
            )
          ) {
            return;
          }
          deleteMessage(id, div);
        });
      }
    }
  }

  function deleteMessage(id, div) {
    fetch('/api/messages/' + encodeURIComponent(id), {
      method: 'DELETE',
      credentials: 'same-origin',
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        if (data.success) {
          if (div && div.parentNode) div.parentNode.removeChild(div);
        } else {
          alert('Failed to delete message.');
        }
      })
      .catch(function () {
        alert('Failed to delete message.');
      });
  }

  function clearEmptyPlaceholder() {
    var el = messagesArea.querySelector('.messages-empty');
    if (el) el.remove();
  }

  function setLoading(loading) {
    if (loading) {
      messagesArea.innerHTML = '<div class="messages-loading">Loading…</div>';
    }
  }

  function loadHistory() {
    setLoading(true);
    fetch('/api/messages/chat?page=1&pageSize=50', {
      credentials: 'same-origin',
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        messagesArea.innerHTML = '';
        shownIds = Object.create(null);
        lastMessageCreatedAt = null;
        if (data.success && data.messages && data.messages.length) {
          data.messages.forEach(function (m) {
            renderMessage(
              m.content,
              m.messageType === 'message' ? 'sent' : 'received',
              m.createdAt,
              m._id
            );
            if (m.createdAt) {
              lastMessageCreatedAt = m.createdAt;
            }
          });
        } else {
          messagesArea.innerHTML =
            '<div class="messages-empty">No messages yet. Say hello!</div>';
        }
      })
      .catch(function () {
        messagesArea.innerHTML =
          '<div class="messages-empty">Could not load messages.</div>';
      });
  }

  function sendMessage() {
    var content = messageInput.value.trim();
    if (!content) return;

    console.log('[Chat] POST /api/messages/chat send', {
      content: content.substring(0, 80),
    });
    sendBtn.disabled = true;
    fetch('/api/messages/chat', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: content }),
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        messageInput.value = '';
        console.log(
          '[Chat] POST /api/messages/chat response',
          data.success ? 'success' : 'fail',
          data
        );
        if (data.success) {
          clearEmptyPlaceholder();
          // Immediately render the user message and bot reply so the chat
          // feels responsive even without sockets. Dedup logic based on
          // message ids will prevent double-rendering when socket or polling
          // later delivers the same messages.
          if (data.message && !alreadyShown(data.message._id)) {
            renderMessage(
              data.message.content,
              'sent',
              data.message.createdAt,
              data.message._id
            );
            if (data.message.createdAt) {
              lastMessageCreatedAt = data.message.createdAt;
            }
          }
          if (data.reply && !alreadyShown(data.reply._id)) {
            renderMessage(
              data.reply.content,
              'received',
              data.reply.createdAt,
              data.reply._id
            );
            if (data.reply.createdAt) {
              lastMessageCreatedAt = data.reply.createdAt;
            }
          }
        }
      })
      .catch(function (err) {
        console.log('[Chat] POST /api/messages/chat error', err);
        messageInput.value = content;
      })
      .finally(function () {
        sendBtn.disabled = false;
      });
  }

  function attachSocketListeners() {
    var socket =
      typeof window !== 'undefined' && window.socket ? window.socket : null;
    if (!socket) {
      console.log(
        '[Chat] attachSocketListeners: no real socket, will use polling fallback'
      );
      startPolling();
      return;
    }
    console.log(
      '[Chat] attachSocketListeners: subscribing to chat:message and chat:reply',
      {
        socketId: socket.id,
        connected: socket.connected,
      }
    );
    socket.once('connect', function () {
      console.log('[Chat] socket connected (chat listeners active)', {
        socketId: socket.id,
      });
    });
    socket.on('chat:message', function (data) {
      console.log('[Chat] socket chat:message received', data);
      if (alreadyShown(data.messageId)) {
        console.log(
          '[Chat] socket chat:message skipped (already shown)',
          data.messageId
        );
        return;
      }
      clearEmptyPlaceholder();
      renderMessage(data.content, 'sent', data.createdAt, data.messageId);
      if (data.createdAt) {
        lastMessageCreatedAt = data.createdAt;
      }
      if (data.messageId) {
        fetch('/api/messages/' + encodeURIComponent(data.messageId) + '/read', {
          method: 'PATCH',
          credentials: 'same-origin',
        }).catch(function (err) {
          console.log('[Chat] markAsRead (chat:message) error', err);
        });
      }
    });
    socket.on('chat:reply', function (data) {
      console.log('[Chat] socket chat:reply received', data);
      if (alreadyShown(data.messageId)) {
        console.log(
          '[Chat] socket chat:reply skipped (already shown)',
          data.messageId
        );
        return;
      }
      clearEmptyPlaceholder();
      renderMessage(data.content, 'received', data.createdAt, data.messageId);
      if (data.createdAt) {
        lastMessageCreatedAt = data.createdAt;
      }
      if (data.messageId) {
        fetch('/api/messages/' + encodeURIComponent(data.messageId) + '/read', {
          method: 'PATCH',
          credentials: 'same-origin',
        }).catch(function (err) {
          console.log('[Chat] markAsRead (chat:reply) error', err);
        });
      }
    });
  }

  function startPolling() {
    if (pollingIntervalId !== null) return;
    console.log('[Chat] Starting polling fallback for chat log');
    pollingIntervalId = setInterval(function () {
      var since = lastMessageCreatedAt;
      var url = '/api/messages/chat?page=1&pageSize=50';
      if (since) {
        url += '&since=' + encodeURIComponent(since);
      }
      fetch(url, {
        credentials: 'same-origin',
      })
        .then(function (res) {
          return res.json();
        })
        .then(function (data) {
          if (!data.success || !data.messages) return;
          data.messages.forEach(function (m) {
            if (alreadyShown(m._id)) {
              return;
            }
            clearEmptyPlaceholder();
            renderMessage(
              m.content,
              m.messageType === 'message' ? 'sent' : 'received',
              m.createdAt,
              m._id
            );
            if (m.createdAt) {
              lastMessageCreatedAt = m.createdAt;
            }
          });
        })
        .catch(function (err) {
          console.log('[Chat] polling error', err);
        });
    }, 1000);
  }

  messageInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  sendBtn.addEventListener('click', sendMessage);

  loadHistory();
  attachSocketListeners();

  window.addEventListener('beforeunload', function () {
    if (pollingIntervalId !== null) {
      clearInterval(pollingIntervalId);
      pollingIntervalId = null;
    }
  });
})();
