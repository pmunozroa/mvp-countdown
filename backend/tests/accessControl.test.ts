/* Pruebas de autorización */
import { ensureAccess } from '../src/common/access';

describe('ensureAccess', () => {
  it('permite roles autorizados', () => {
    expect(() => ensureAccess('editor', ['owner', 'editor'])).not.toThrow();
  });

  it('bloquea roles no autorizados', () => {
    expect(() => ensureAccess('viewer', ['owner'])).toThrow('Acceso denegado');
  });

  it('bloquea ausencia de rol', () => {
    expect(() => ensureAccess(undefined, ['owner'])).toThrow('Acceso denegado');
  });
});
