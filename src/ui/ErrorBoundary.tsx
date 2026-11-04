// Se algo quebrar na renderização, mostra uma saída em vez de uma tela em branco.
import { Component, type ReactNode } from 'react';
import { SAVE_KEY } from '../engine/save';

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  private downloadRawSave = () => {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    const url = URL.createObjectURL(new Blob([raw], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bandmates-save-com-erro.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  private reset = () => {
    localStorage.removeItem(SAVE_KEY);
    location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main className="title-screen">
        <h1 className="logo">Ops.</h1>
        <p className="title-screen__tag">Algo deu errado no Bandmates. O save está guardado — você pode tentar de novo.</p>
        <pre className="error-detail">{this.state.error.message}</pre>
        <div className="title-screen__actions">
          <button className="primary-btn" onClick={() => location.reload()}>
            Tentar de novo
          </button>
          <button className="ghost-btn" onClick={this.downloadRawSave}>
            Baixar o save (para investigar)
          </button>
          <button className="danger-btn" onClick={this.reset}>
            Apagar o save e recomeçar
          </button>
        </div>
      </main>
    );
  }
}
