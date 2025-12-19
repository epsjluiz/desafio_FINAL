import { Component } from '@angular/core';

@Component({
  selector: 'app-contatos',
  templateUrl: './contatos.component.html',
  styleUrls: ['./contatos.component.css']
})
export class ContatosComponent {
  nome: string = '';
  email: string = '';
  telefone: string = '';
  tipoContato: string = '';
  mensagem: string = '';
  
  concordaTermos: boolean = false;
  receberNovidades: boolean = false;

  enviar(): void {
    console.log('Formulário enviado', {
      nome: this.nome,
      email: this.email,
      telefone: this.telefone,
      tipoContato: this.tipoContato,
      mensagem: this.mensagem,
      concordaTermos: this.concordaTermos,
      receberNovidades: this.receberNovidades
    });
    alert('Mensagem enviada com sucesso!');
  }
}
