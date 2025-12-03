import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  handleLogin(): void {
    if (this.authService.login(this.username, this.password)) {
      this.router.navigate(['/listagem']);
    } else {
      alert('Usuário ou senha inválidos');
    }
  }
}

