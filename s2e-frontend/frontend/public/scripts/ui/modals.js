document.addEventListener("DOMContentLoaded", function () {
  Promise.all([
    fetch("./auth/login.html").then((res) => res.text()),
    fetch("./auth/register.html").then((res) => res.text()),
  ])
    .then(([loginHTML, registerHTML]) => {
      const modalHTML = `
        <div class="modal fade" id="authModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <ul class="nav nav-tabs card-header-tabs" id="authTabs" role="tablist">
                            <li class="nav-item">
                                <button class="nav-link active" id="login-tab" data-bs-toggle="tab" data-bs-target="#loginTabPane" type="button" role="tab">
                                    Login
                                </button>
                            </li>
                            <li class="nav-item">
                                <button class="nav-link" id="register-tab" data-bs-toggle="tab" data-bs-target="#registerTabPane" type="button" role="tab">
                                    Sign Up
                                </button>
                            </li>
                        </ul>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="tab-content">
                            <div class="tab-pane fade show active" id="loginTabPane" role="tabpanel">
                                ${loginHTML}
                            </div>
                            <div class="tab-pane fade" id="registerTabPane" role="tabpanel">
                                ${registerHTML}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

      document.body.insertAdjacentHTML("beforeend", modalHTML);
    })
    .catch((err) => console.error("Error loading modals:", err));
});
