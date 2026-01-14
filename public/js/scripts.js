$(document).ready(function(){
  $('.sidenav').sidenav();

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