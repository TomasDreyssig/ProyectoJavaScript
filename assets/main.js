class JuegosController {
  constructor() {
    this.listaJuegos = []
    this.contenedor_productos = document.getElementById("productos_display")
  }

  levantar() {
    let obtenerlistaJSON = localStorage.getItem("listaJuegos")

    if (obtenerlistaJSON) {
      this.listaJuegos = JSON.parse(obtenerlistaJSON)
    }
  }

  async juegosCargados () {
      let respuesta = await fetch('./assets/APIJuegos.json')
      this.listaJuegos = await respuesta.json()
      this.render()
  }

  render() {
    this.listaJuegos.forEach(juego => {
      this.contenedor_productos.innerHTML += `
      <div class="card" style="width: 18rem;">
          <img src="${juego.img}" class="card-img-top" alt="${juego.alt}">
          <div class="card-body">
        <h5 class="card-title">${juego.nombre}</h5>
          <p class="card-text">
          ${juego.descripcion}
          $${juego.precio}
        </p>
          <a href="#" class="btn btn-primary" id="juego ${juego.id}">Agregar al carrito</a>
      </div>
    </div>`
    })
  }

  eventoAgregar(controladorCarrito) {
      this.listaJuegos.forEach(juego => {
        const futuraCompra = document.getElementById(`juego ${juego.id}`)
        futuraCompra.addEventListener("click", () => {
  
          controladorCarrito.agregar(juego)
          controladorCarrito.levantar()
          controladorCarrito.render()
          controladorCarrito.precioDOM()
  
          Toastify({
            text: "Producto agregado al carrito.",
            duration: 2000,
            gravity: "bottom", // `top` or `bottom`
            position: "right", // `left`, `center` or `right`
            style: {
              background: "linear-gradient(to right, #090979, #00d4ff)",
            }
          }).showToast();
      
        })
      })
    }
  
  }



class CarritoController {
  constructor() {
    this.listaCarrito = []
    this.contenedor_carrito = document.getElementById("contenedor_carrito")
    this.finalizar_compra = document.getElementById("finalizar")
    this.precio_sinIMP = document.getElementById("precio_sinIMP")
    this.precio_total = document.getElementById("precio_total")
    this.vaciar_carrito = document.getElementById("vaciar_carrito")
  }

  levantar() {
    this.listaCarrito = JSON.parse(localStorage.getItem("listaCarrito")) || []
  }

  agregar(juego) {
    let buscarJuego = this.listaCarrito.some( e => e.id == juego.id)

    if (buscarJuego){
      const juegolisto = this.buscar(juego.id)
      juegolisto.cantidad += 1
    }else{
      this.listaCarrito.push(juego)
    }

    let enformatoJSON = JSON.stringify(this.listaCarrito)
    localStorage.setItem("listaCarrito", enformatoJSON)
  }

  buscar(id){
    return this.listaCarrito.find(juego => juego.id == id)
  }

  // DOM 

  cardHorizontal (juego){
    return `
    <div class="card mb-3" style="max-width: 540px;">
      <div class="row g-0">
        <div class="col-md-4">
      <img src="${juego.img}" class="img-fluid rounded-start" alt="${juego.alt}">
    </div>
      <div class="col-md-8">
        <div class="card-body">
      <h5 class="card-title">${juego.nombre}</h5>
      <p class="card-text">$${juego.precio}</p>
      <p class="card-text"><small class="text-muted">${juego.descripcion}</small></p>
      <p class="card-text"><small class="text-muted">Cantidad: ${juego.cantidad}</small></p>
      <button class="btn btn-danger" id="eliminar${juego.id}"><i class="fa-solid fa-trash-can"></i></button>
        </div>
      </div>
    </div>
  </div>`
  }

  render() {
    this.limpiarDOM()

    this.listaCarrito.forEach(juego => {
      this.contenedor_carrito.innerHTML += this.cardHorizontal(juego)
    })   

    this.precioDOM()
    this.eventoBorrar()
  }

  eventoBorrar (){
      this.listaCarrito.forEach( juego => {
      document.getElementById(`eliminar${juego.id}`).addEventListener("click" , () => {
        //ELIMINAR DEL ARRAY
        this.borrar(juego)
        //ACTUALIZAR STORAGE
        localStorage.setItem("listaCarrito", JSON.stringify(this.listaCarrito))
        //VOLVER A IMPRIMIR
      this.render()
      this.precioDOM()
    } )
          })
  }

  finalizarCompra (){
    this.finalizar_compra.addEventListener("click", () => {

      if(controladorCarrito.listaCarrito.length > 0){
    
      this.limpiar()
      this.render()
      this.precioDOM()
    
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Ha realizado su compra con éxito!',
        showConfirmButton: true,
        timer: 2000
      })}else{
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Tienes que añadir al menos un producto para realizar una compra.',
          })
       
      }
    })
  }

  calcularPrecio(){
      return this.listaCarrito.reduce((acumulador, juego) => acumulador + juego.precio * juego.cantidad ,0)
      
  }

  calcularconIMP (){
    const IVA = 1.21
    const servDigital = 0.05
    const impPais = 0.08
    const percepcion = 0.45
      
    return this.calcularPrecio() * (IVA + servDigital + impPais + percepcion)
  }

  precioDOM(){
    this.precio_sinIMP.innerHTML = "$" + this.calcularPrecio()
    this.precio_total.innerHTML = "$" + this.calcularconIMP()
  }

  limpiarDOM (){
    this.contenedor_carrito.innerHTML = ""
  }

  limpiar(){
    this.listaCarrito = []
    localStorage.removeItem("listaCarrito")
  }

  borrar(juego){
    let index = this.listaCarrito.indexOf(juego)
    this.listaCarrito.splice(index, 1)

    this.precioDOM()
  }
  
  vaciarCarrito(){
    this.vaciar_carrito.addEventListener( "click", () => {
        this.limpiar()
        this.render()
    })
  }
}

//DECLARANDO CONTROLADORES Y LEVANTANDO JUEGOS
const controladorJuegos = new JuegosController()
const controladorCarrito = new CarritoController()

controladorJuegos.levantar()
controladorCarrito.levantar()

// TRAEMOS JUEGOS DE LA API, Y DAMOS FUNCIONALIDAD AL BOTON DE SU CARD
controladorJuegos.juegosCargados().then(() => controladorJuegos.eventoAgregar(controladorCarrito))

// PRODUCTOS EN APP

controladorJuegos.render()
controladorCarrito.render()


// ALERT DE FINALIZACION DE COMPRA
controladorCarrito.finalizarCompra()

// EVENTO A VACIAR CARRITO
controladorCarrito.vaciarCarrito()