import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  signal,
  viewChild
} from '@angular/core';

interface Versiculo {
  texto: string;
  cita: string;
}

interface Foto {
  src: string;
  alt: string;
}

interface Destello {
  id: number;
  left: number;
  top: number;
  size: number;
  delay: number;
  duration: number;
}

interface Paloma {
  id: number;
  left: number;
  delay: number;
  duration: number;
  emoji: string;
  size: number;
}

interface Chispa {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  deriva: number;
}

@Component({
  selector: 'app-tarjeta-memorial',
  templateUrl: './tarjeta-memorial.html',
  styleUrl: './tarjeta-memorial.css'
})
export class TarjetaMemorial implements OnInit, AfterViewInit, OnDestroy {
  // =====================================================================
  //  DATOS PERSONALIZABLES
  // =====================================================================
  readonly nombre = 'Juana Mollinedo Flores';

  // Jueves 12 de noviembre de 2026 (el mes va de 0 a 11, por eso noviembre = 10)
  private readonly fechaEvento = new Date(2026, 10, 12);
  readonly fechaTexto = 'Jueves 12 de noviembre de 2026 Hrs. 6 PM';

  // ⚠️ Escribe aquí la hora (ejemplo: '19:00 hrs'). Si lo dejas vacío, no se muestra.
  readonly hora = '';

  readonly lugarNombre = 'Iglesia Evangélica - Maranatha I';
  readonly lugarZona = 'Av. José Ballivian 2045, El Alto';
  readonly urlMapa = 'https://maps.app.goo.gl/wn9ovQ4eu5UshFcJ7?g_st=aw';

  // Fotos (colócalas en la carpeta public/images/)
  readonly fotoPrincipal = 'images/principal.jpg';
  readonly fotos: Foto[] = [
    { src: 'images/galeria1.jpg', alt: 'Recuerdo de Juana Mollinedo Flores' },
    { src: 'images/galeria2.jpg', alt: 'Recuerdo de Juana Mollinedo Flores' },
    { src: 'images/galeria3.jpg', alt: 'Recuerdo de Juana Mollinedo Flores' },
    { src: 'images/galeria4.jpg', alt: 'Recuerdo de Juana Mollinedo Flores' }
  ];

  // Pasajes bíblicos (Reina-Valera 1909, dominio público). Rotan cada 8 segundos.
  readonly versiculos: Versiculo[] = [
    {
      texto: 'Yo soy la resurrección y la vida: el que cree en mí, aunque esté muerto, vivirá.',
      cita: 'Juan 11:25'
    },
    {
      texto:
        'Aunque ande en valle de sombra de muerte, no temeré mal alguno; porque tú estarás conmigo.',
      cita: 'Salmo 23:4'
    },
    {
      texto:
        'Y Dios limpiará toda lágrima de los ojos de ellos; y la muerte no será más; ni habrá más llanto, ni clamor, ni dolor.',
      cita: 'Apocalipsis 21:4'
    },
    {
      texto: 'Bienaventurados los que lloran, porque ellos recibirán consolación.',
      cita: 'Mateo 5:4'
    },
    {
      texto: 'He peleado la buena batalla, he acabado la carrera, he guardado la fe.',
      cita: '2 Timoteo 4:7'
    }
  ];

  // Música (public/audio/musica.mp3). Puedes reemplazar el archivo por otra pista.
  readonly musicaUrl = 'musica/musica.mp3';

  // =====================================================================
  //  APERTURA DE LA BIBLIA
  // =====================================================================
  fase = signal<'cerrada' | 'abriendo' | 'abierta'>('cerrada');
  mostrarLuz = signal<boolean>(false);
  private readonly DURACION_APERTURA_MS = 2400;

  abrirBiblia(): void {
    if (this.fase() !== 'cerrada') return;

    // La música debe iniciarse DENTRO del clic del usuario para que el
    // navegador permita el autoplay (no dentro del setTimeout).
    this.iniciarMusica();

    this.fase.set('abriendo');
    this.mostrarLuz.set(true);
    setTimeout(() => {
      this.fase.set('abierta');
      this.iniciarVersiculos();
      // El destello se disipa suavemente y luego se elimina del DOM
      setTimeout(() => this.mostrarLuz.set(false), 1800);
    }, this.DURACION_APERTURA_MS);
  }

  // Destellos de luz / polvo dorado del fondo (decorativos)
  readonly destellos: Destello[] = Array.from({ length: 46 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: 2 + Math.random() * 3,
    delay: Math.random() * 5,
    duration: 3 + Math.random() * 3
  }));

  // =====================================================================
  //  CUENTA REGRESIVA
  // =====================================================================
  diasRestantes = signal<number>(0);

  ngOnInit(): void {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const ms = this.fechaEvento.getTime() - hoy.getTime();
    this.diasRestantes.set(Math.round(ms / (1000 * 60 * 60 * 24)));
  }

  // =====================================================================
  //  VERSÍCULOS ROTATIVOS
  // =====================================================================
  indiceVersiculo = signal<number>(0);
  private intervaloVersiculos: ReturnType<typeof setInterval> | null = null;

  private iniciarVersiculos(): void {
    if (this.intervaloVersiculos) clearInterval(this.intervaloVersiculos);
    this.intervaloVersiculos = setInterval(() => {
      this.indiceVersiculo.set((this.indiceVersiculo() + 1) % this.versiculos.length);
    }, 8000);
  }

  // Al tocar un punto se muestra ese pasaje y se reinicia el temporizador
  irAVersiculo(i: number): void {
    this.indiceVersiculo.set(i);
    this.iniciarVersiculos();
  }

  // =====================================================================
  //  GALERÍA CON VISOR AMPLIADO
  // =====================================================================
  fotoAmpliada = signal<number | null>(null);

  abrirFoto(i: number): void {
    this.fotoAmpliada.set(i);
  }

  cerrarFoto(): void {
    this.fotoAmpliada.set(null);
  }

  fotoSiguiente(evento: Event): void {
    evento.stopPropagation();
    const actual = this.fotoAmpliada();
    if (actual === null) return;
    this.fotoAmpliada.set((actual + 1) % this.fotos.length);
  }

  fotoAnterior(evento: Event): void {
    evento.stopPropagation();
    const actual = this.fotoAmpliada();
    if (actual === null) return;
    this.fotoAmpliada.set((actual - 1 + this.fotos.length) % this.fotos.length);
  }

  // =====================================================================
  //  VELA DE RECUERDO
  // =====================================================================
  velaEncendida = signal<boolean>(false);
  humo = signal<boolean>(false);
  palomas = signal<Paloma[]>([]);
  private timeoutPalomas: ReturnType<typeof setTimeout> | null = null;
  private timeoutHumo: ReturnType<typeof setTimeout> | null = null;

  // Chispas doradas que flotan alrededor de la llama (se generan una vez)
  readonly chispas: Chispa[] = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    left: 38 + Math.random() * 24,
    delay: Math.random() * 3,
    duration: 2.6 + Math.random() * 2.4,
    size: 2 + Math.random() * 3,
    deriva: -26 + Math.random() * 52
  }));

  alternarVela(): void {
    if (this.velaEncendida()) {
      // Apagar: sale un hilo de humo
      this.velaEncendida.set(false);
      this.palomas.set([]);
      this.humo.set(true);
      if (this.timeoutHumo) clearTimeout(this.timeoutHumo);
      this.timeoutHumo = setTimeout(() => this.humo.set(false), 2600);
      return;
    }

    this.humo.set(false);
    this.velaEncendida.set(true);

    const emojis = ['🕊️', '✨', '🤍', '🕊️'];
    this.palomas.set(
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: 8 + Math.random() * 84,
        delay: 0.6 + Math.random() * 2.2,
        duration: 5.5 + Math.random() * 3,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        size: 1.3 + Math.random() * 1
      }))
    );

    if (this.timeoutPalomas) clearTimeout(this.timeoutPalomas);
    this.timeoutPalomas = setTimeout(() => this.palomas.set([]), 10000);
  }

  // =====================================================================
  //  MÚSICA
  // =====================================================================
  // El <audio> vive siempre en el DOM y su src se asigna una sola vez desde
  // aquí (no con [src] en el template) para que ningún cambio de estado
  // reinicie la reproducción.
  reproduciendo = signal<boolean>(false);
  errorMusica = signal<boolean>(false);
  private audioPlayer = viewChild.required<ElementRef<HTMLAudioElement>>('audioPlayer');

  ngAfterViewInit(): void {
    const audio = this.audioPlayer().nativeElement;
    audio.src = this.musicaUrl;
    audio.load();
  }

  // Se llama cuando el navegador no logra cargar el archivo de audio
  alFallarMusica(): void {
    this.errorMusica.set(true);
    this.reproduciendo.set(false);
    console.error(
      `[Tarjeta] No se pudo cargar la música "${this.musicaUrl}". ` +
        'Verifica que exista el archivo public/audio/musica.mp3 y reinicia ng serve.'
    );
  }

  private iniciarMusica(): void {
    const audio = this.audioPlayer().nativeElement;
    const intento = audio.play();
    if (intento) {
      intento
        .then(() => this.reproduciendo.set(true))
        .catch(() => this.reproduciendo.set(false));
    }
  }

  alternarMusica(): void {
    const audio = this.audioPlayer().nativeElement;
    if (audio.paused) {
      const intento = audio.play();
      if (intento) {
        intento
          .then(() => this.reproduciendo.set(true))
          .catch(() => this.reproduciendo.set(false));
      }
    } else {
      audio.pause();
      this.reproduciendo.set(false);
    }
  }

  ngOnDestroy(): void {
    if (this.intervaloVersiculos) clearInterval(this.intervaloVersiculos);
    if (this.timeoutPalomas) clearTimeout(this.timeoutPalomas);
    if (this.timeoutHumo) clearTimeout(this.timeoutHumo);
  }
}
