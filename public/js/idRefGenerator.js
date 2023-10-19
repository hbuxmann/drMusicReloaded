function generarCadenaAleatoria() {
    const caracteresPermitidos = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const longitud = 10;
    let cadenaAleatoria = '';
  
    for (let i = 0; i < longitud; i++) {
      const indiceAleatorio = Math.floor(Math.random() * caracteresPermitidos.length);
      const caracterAleatorio = caracteresPermitidos.charAt(indiceAleatorio);
      cadenaAleatoria += caracterAleatorio;
    }
  
    return cadenaAleatoria;
  }
  
  const cadenaAleatoria = generarCadenaAleatoria();
  console.log(cadenaAleatoria);


  module.exports = generarCadenaAleatoria;