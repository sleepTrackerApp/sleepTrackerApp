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
});