$(document).ready(function () {
  $('.sidenav').sidenav();

  // Header: show background when scrolled
  const $topNav = $('#top-nav');
  if ($topNav.length) {
    const threshold = 24;
    function updateNavScrolled() {
      $topNav.toggleClass('top-nav--scrolled', $(window).scrollTop() > threshold);
    }
    updateNavScrolled();
    $(window).on('scroll', updateNavScrolled);
  }

  // Profile dropdown (authenticated header)
  const $profileBtn = $('#header-profile-btn');
  const $profileDropdown = $('#header-profile-dropdown');
  if ($profileBtn.length && $profileDropdown.length) {
    $profileBtn.on('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      $profileDropdown.toggleClass('is-open');
      $profileDropdown.attr('aria-hidden', $profileDropdown.hasClass('is-open') ? 'false' : 'true');
      $profileBtn.attr('aria-expanded', $profileDropdown.hasClass('is-open'));
    });
    $(document).on('click', function (e) {
      if ($profileDropdown.hasClass('is-open') && !$(e.target).closest('#header-profile-btn, #header-profile-dropdown').length) {
        $profileDropdown.removeClass('is-open').attr('aria-hidden', 'true');
        $profileBtn.attr('aria-expanded', 'false');
      }
    });
  }

  const toast = document.getElementById('saveToast');
  const triggers = document.querySelectorAll('.js-confirm-save');
  if (toast && triggers.length) {
    triggers.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
      });
    });
  }

  // Person-Bell Swap Notification (authenticated header)
  window.refreshNotifications = async () => {
    try {
      const response = await fetch('/api/messages/unread');
      const data = await response.json();
      const count = data.unreadCount || 0;

      const $navIcon = $('#nav-user-icon');
      const $notifText = $('#notif-text');

      if (count > 0) {
        $navIcon.text('notifications_active');
        $navIcon.addClass('red-text');
        $notifText.html(`You have <span class="red-text" style="font-weight: 700;">${count}</span> new message${count > 1 ? 's' : ''}`);
        
      } else {
        $navIcon.text('person');
        $navIcon.removeClass('teal-text');
        $notifText.text('You have no new messages');
        
      }
    } catch (err) { console.error('Notification refresh failed', err); }
  };

  refreshNotifications();

  if (window.location.pathname.includes('/profile')) {
    fetch('/api/messages/mark-all-read', { method: 'POST' }).then(() => refreshNotifications());
  }

  if (window.socket) {
    window.socket.on('message:new', refreshNotifications);
  }
});