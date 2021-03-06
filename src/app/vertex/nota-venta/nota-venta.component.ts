import { Component, OnInit, Input } from '@angular/core';
import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';

import { environment } from 'environments/environment';
import { HttpClient} from '@angular/common/http';

import { UsuariosService } from "./services/usuarios.service";
import { MicasService } from "./services/micas.service";
import { ArmazonesService } from "./services/armazones.service";
import { OtrosProdService } from "./services/otrosProd.service";

import { AuthService } from "../../shared/services/auth.service";

interface IMica {
  nombre: string
  grad: string
  precio : number
  cantidad : number
  total : number
}

interface IArmazon {
  nombre: string
  precio : number
  cantidad : number
  total : number
}

interface IProducto {
  nombre: string
  precio : number
  cantidad : number
  total : number
}

class NotaVenta {
  cliente: string
  pago: number
  fechaVenta: Date
  listArmazones: IArmazon[]
  vendedor: string
}

@Component({
  selector: 'nota-venta',
  templateUrl: './nota-venta.component.html',
  styleUrls: ['./nota-venta.component.scss'],
})
export class NotaVentaComponent implements OnInit {

  formaNotaVenta: FormGroup;
  titulo = "Nota de Venta";
  total : number = 0;
  notaVenta : NotaVenta;
  private urlServidor:string;

  year : string;
  month: string;
  day: string;
  dateString: string;
  fechaVenta: Date;

  profile: any;

  constructor(
    private usuariosService: UsuariosService,
    private micasService: MicasService,
    private armazonesService: ArmazonesService,
    private otrosProdService :OtrosProdService,
    private modalService: NgbModal,
    private http: HttpClient,
    private auth: AuthService,
  ) { 
      this.urlServidor = environment.serverUrl + 'notaVenta';
  }

  ngOnInit() {
    this.formaNotaVenta = new FormGroup({
      'cliente': new FormControl(),
      'fechaCompra': new FormControl(),
      'prodMica': new FormControl(),
      'valorMica1': new FormControl([ 5 ]),
      'pedidoMicas' : new FormArray([]),
      'prodArmazon': new FormControl(),
      'pedidoArmazones' : new FormArray([]),
      'prodOtro': new FormControl(),
      'pedidoProductos' : new FormArray([]),
      'pago': new FormControl(),
    });

    //OBTIENE INFORMACION DEL USUARIO AUTENTIFICADO
    if (this.auth.userProfile) {
        this.profile = this.auth.userProfile;
        console.log(this.profile);
    } else {
        this.auth.getProfile((err, profile) => {
          this.profile = profile;
          console.log(this.profile);
        });
    }
  }

  onAceptar(){
    
    this.notaVenta = new NotaVenta()
    this.notaVenta.cliente = this.formaNotaVenta.get('cliente').value;
    this.notaVenta.pago = this.formaNotaVenta.get('pago').value;

    this.year  = this.formaNotaVenta.get('fechaCompra').value.year;
    this.month = this.formaNotaVenta.get('fechaCompra').value.month;
    this.day = this.formaNotaVenta.get('fechaCompra').value.day;

    if (this.month.toString().length == 1){
      this.month = `0${this.month}`
    }

    this.dateString = `${this.year}-${this.month}-${this.day}T00:00:00` 
    this.fechaVenta = new Date(this.dateString);

    this.notaVenta.fechaVenta = this.fechaVenta

    //VENDEDOR
    this.notaVenta.vendedor = this.profile.name

    //LISTA ARMAZONES
    this.notaVenta.listArmazones = this.formaNotaVenta.get('pedidoArmazones').value;

    console.log(this.notaVenta);

    this.http.post<NotaVenta>(this.urlServidor, this.notaVenta)
            .subscribe(response => {
                this.notaVenta = response;
            });

  }

  busquedaCliente = (text$: Observable<string>) =>
    text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => term.length < 2 ? []
        : this.usuariosService.clientes.filter(v => new RegExp(term, 'gi').test(v)).splice(0, 15));

  busquedaMica = (text$: Observable<string>) =>
    text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => term.length < 2 ? []
        : this.micasService.micas.filter(v => new RegExp(term, 'gi').test(v)).splice(0, 15));

  busquedaArmazon = (text$: Observable<string>) =>
    text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => term.length < 2 ? []
        : this.armazonesService.armazones.filter(v => new RegExp(term, 'gi').test(v)).splice(0, 15));

  busquedaProducto = (text$: Observable<string>) =>
    text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => term.length < 2 ? []
        : this.otrosProdService.otros.filter(v => new RegExp(term, 'gi').test(v)).splice(0, 15));

  public someKeyboardConfig2: any = {
    behaviour: 'drag',
    connect: true,
    start: [0],
    keyboard: true,
    step: 0.05,
    pageSteps: 10,  // number of page steps, defaults to 10
    range: {
      min: 0,
      max: 10
    },
    pips: {
      mode: 'count',
      density: 2,
      values: 11,
      stepped: true
    }
  };

  asignaGrad(valor){
    this.mica01.setValue(valor);
  }

  incValor(){
    this.mica01.setValue(
      +this.mica01.value + .05
    );
  }

  decValor(){
    this.mica01.setValue(
      +this.mica01.value - .05
    );
  }

  get mica01(){
    return this.formaNotaVenta.get('valorMica1') as FormControl;
  }

  addListaMicas(){
    var mica: IMica = {
      nombre: this.formaNotaVenta.get('prodMica').value,
      grad: this.formaNotaVenta.get('valorMica1').value,
      precio: (Math.random() * 100),
      cantidad: 0,
      total: 0,
    };
    this.listaMicas.insert(0, new FormControl(mica))
    this.formaNotaVenta.controls.prodMica.setValue('');
  }

  deleteMica(micaReg : FormControl){
    this.total = this.total - micaReg.value.total;
    let index = this.listaMicas.controls.indexOf(micaReg);
    this.listaMicas.removeAt(index);
  }

  get listaMicas(){
    return this.formaNotaVenta.get('pedidoMicas') as FormArray;
  }

  ajustaCantidad(micaReg: FormControl, ajuste: number){
    micaReg.value.cantidad = micaReg.value.cantidad + ajuste;
    micaReg.value.total = micaReg.value.cantidad * micaReg.value.precio;
    this.total = this.total + (micaReg.value.precio * ajuste);
  }

  addListaArmazones(){
    var armazon: IArmazon = {
      nombre: this.formaNotaVenta.get('prodArmazon').value,
      precio: (Math.random() * 100),
      cantidad: 0,
      total: 0,
    };
    this.listaArmazones.insert(0, new FormControl(armazon))
    this.formaNotaVenta.controls.prodArmazon.setValue('');
  }

  deleteArmazon(armReg : FormControl){
    this.total = this.total - armReg.value.total;
    let index = this.listaArmazones.controls.indexOf(armReg);
    this.listaArmazones.removeAt(index);
  }

  get listaArmazones(){
    return this.formaNotaVenta.get('pedidoArmazones') as FormArray;
  }

  addListaProductos(){
    var producto: IProducto = {
      nombre: this.formaNotaVenta.get('prodOtro').value,
      precio: (Math.random() * 100),
      cantidad: 0,
      total: 0,
    };
    this.listaProductos.insert(0, new FormControl(producto))
    this.formaNotaVenta.controls.prodOtro.setValue('');
  }

  deleteProducto(prodReg : FormControl){
    this.total = this.total - prodReg.value.total;
    let index = this.listaProductos.controls.indexOf(prodReg);
    this.listaProductos.removeAt(index);
  }

  get listaProductos(){
    return this.formaNotaVenta.get('pedidoProductos') as FormArray;
  }

  openContent() {
    const modalRef = this.modalService.open(NgbdModalContent, {
      size: 'lg'
    });
    modalRef.componentInstance.listaMicas = this.listaMicas;
    modalRef.componentInstance.listaArmazones = this.listaArmazones;
    modalRef.componentInstance.listaProductos = this.listaProductos;
    modalRef.componentInstance.cliente = this.formaNotaVenta.get('cliente').value;
    modalRef.componentInstance.fechaCompra = this.formaNotaVenta.get('fechaCompra').value;
    modalRef.componentInstance.total = this.total;
    modalRef.componentInstance.pago = this.formaNotaVenta.get('pago').value;
  }
}

@Component({
  selector: 'ngbd-modal-content',
  templateUrl: './nota-venta-modal.html',
})
export class NgbdModalContent {
  @Input() listaMicas;
  @Input() listaArmazones;
  @Input() listaProductos;
  @Input() cliente;
  @Input() fechaCompra;
  @Input() total;
  @Input() pago;
  constructor(public activeModal: NgbActiveModal) { }
}
