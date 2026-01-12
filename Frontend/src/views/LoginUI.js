import ReceiptIcon from "../assets/svg/receipt.js";

export default () => {
  return `
    <div class="page-div">
      <div class="row">
        <div class="title-container">
          ${ReceiptIcon}
          <h1>Billed</h1>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-6">
          <div class="card">
            <div class="card-body">
              <form class="form-signin" data-testid="form-employee">
                <h2 class="h3 mb-3 font-weight-normal">Employé</h2>
                <label for="inputEmail">Votre email</label>
                <input type="email" data-testid="employee-email-input" class="form-control" placeholder="johndoe@email.com" autocomplete="email" required autofocus>
                <label for="inputPassword">Mot de passe</label>
                <input type="password" data-testid="employee-password-input" class="form-control" placeholder="******" autocomplete="current-password" required>
                <button class="btn btn-lg btn-primary btn-block" data-testid="employee-login-button" type="submit">Se connecter</button>
              </form>
            </div>
          </div>
        </div>
        <div class="col-sm-6">
          <div class="card">
            <div class="card-body">
              <form class="form-signin" data-testid="form-admin">
                <h2 class="h3 mb-3 font-weight-normal">Administration</h2>
                <label for="inputEmail">Votre email</label>
                <input type="email" data-testid="admin-email-input" class="form-control" placeholder="johndoe@email.com" autocomplete="email" required autofocus>
                <label for="inputPassword">Mot de passe</label>
                <input type="password" data-testid="admin-password-input" class="form-control" placeholder="******" autocomplete="current-password" required>
                <button type="submit" class="btn btn-lg btn-primary btn-block" data-testid="admin-login-button">Se connecter</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
};
