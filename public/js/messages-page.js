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
    div.innerHTML =
      (content || '').replace(/</g, '&lt;').replace(/>/g, '&gt;') +
      (time ? '<div class="message-time">' + time + '</div>' : '');
    messagesArea.appendChild(div);
    messagesArea.scrollTop = messagesArea.scrollHeight;
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
        if (data.success && data.messages && data.messages.length) {
          data.messages.forEach(function (m) {
            renderMessage(
              m.content,
              m.messageType === 'message' ? 'sent' : 'received',
              m.createdAt,
              m._id
            );
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
      console.log('[Chat] attachSocketListeners: no window.socket, skipping');
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
    });
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
})();
