/**
 * Socket connection and bedtime notification popup + beeping.
 * Loaded only when user is signed in (with socket.io). Depends on jQuery.
 */
(function ($) {
  'use strict';

  if (typeof io === 'undefined') {
    return;
  }

  var isBeeping = false;
  var beeperInterval = null;
  var audioContext = null;
  var activeOscillators = [];

  function escapeHtml(text) {
    if (text === null) return '';
    var div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
  }

  function initAudioContext() {
    if (!audioContext) {
      try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log('[Sound] Audio context initialized');
      } catch (e) {
        console.log('[Sound] Audio context error:', e.message);
      }
    }
    return audioContext;
  }

  function playNotificationSound() {
    var ctx = initAudioContext();
    if (!ctx) return;
    try {
      var oscillator = ctx.createOscillator();
      var gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);
      activeOscillators.push({ osc: oscillator, gain: gainNode });
    } catch (e) {
      console.log('[Sound] Error playing beep:', e.message);
    }
  }

  function startContinuousBeep() {
    if (isBeeping) return;
    isBeeping = true;
    activeOscillators = [];
    playNotificationSound();
    beeperInterval = setInterval(function () {
      if (isBeeping) playNotificationSound();
    }, 1000);
  }

  function stopContinuousBeep() {
    isBeeping = false;
    if (beeperInterval !== null) {
      clearInterval(beeperInterval);
      beeperInterval = null;
    }
    if (audioContext && activeOscillators.length > 0) {
      activeOscillators.forEach(function (item) {
        try {
          var osc = item.osc || item;
          var gain = item.gain;
          try {
            osc.stop(audioContext.currentTime);
          } catch (_) {}
          try {
            osc.disconnect();
          } catch (_) {}
          if (gain)
            try {
              gain.disconnect();
            } catch (_) {}
        } catch (e) {
          console.log('[Sound] Error stopping oscillator:', e.message);
        }
      });
      activeOscillators = [];
    }
  }

  function showNotificationPopup(notification) {
    var title = notification.title || 'Bedtime Reminder';
    var message = notification.message || 'Time for bed!';
    var timeStr = new Date(notification.timestamp).toLocaleTimeString();

    if (!$('#bedtime-notification-styles').length) {
      $('<style id="bedtime-notification-styles">')
        .text(
          '@keyframes slideIn{from{transform:translateX(450px);opacity:0}to{transform:translateX(0);opacity:1}}' +
            '.notif-stop:hover{background:#ff6b7a!important}'
        )
        .appendTo('head');
    }

    var notifDiv = $('<div>')
      .addClass('bedtime-notification')
      .css({
        position: 'fixed',
        top: '80px',
        right: '20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        maxWidth: '450px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        animation: 'slideIn 0.3s ease-out',
      })
      .html(
        '<div class="notif-content">' +
          '<h4>' +
          escapeHtml(title) +
          '</h4>' +
          '<p>' +
          escapeHtml(message) +
          '</p>' +
          '<small>' +
          escapeHtml(timeStr) +
          '</small>' +
          '</div>' +
          '<div class="notif-buttons" style="display:flex;gap:10px;margin-left:15px;">' +
          '<button class="notif-stop" type="button" style="background:#ff4757;border:none;color:white;padding:8px 15px;border-radius:4px;cursor:pointer;font-weight:bold;">STOP</button>' +
          '<button class="notif-close" type="button" style="background:none;border:none;color:white;font-size:24px;cursor:pointer;padding:0;margin-left:5px;">×</button>' +
          '</div>'
      );

    $('body').append(notifDiv);
    startContinuousBeep();

    notifDiv.find('.notif-stop').on('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      stopContinuousBeep();
      notifDiv.remove();
    });

    notifDiv.find('.notif-close').on('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      stopContinuousBeep();
      notifDiv.remove();
    });

    setTimeout(function () {
      if (notifDiv.parent().length) {
        stopContinuousBeep();
        notifDiv.remove();
      }
    }, 60000);
  }

  var socket = io({ withCredentials: true });
  window.socket = socket;

  socket.on('connect', function () {
    console.log('[Init] Socket connected', { socketId: socket.id });
  });

  socket.on('connect_error', function (err) {
    console.log('[Init] Socket connect_error', {
      message: err.message,
      cause: err.cause,
    });
  });

  socket.on('disconnect', function (reason, description) {
    console.log('[Init] Socket disconnected', {
      reason: reason,
      description: description,
    });
  });

  socket.on('schedule:notification', function (data) {
    console.log('[Init] Received notification:', data);
    if (data.type === 'bedtime') {
      showNotificationPopup(data);
    }
  });
})(jQuery);
