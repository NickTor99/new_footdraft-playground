import { Zap } from 'lucide-react'; // Assicurati di importare l'icona se non c'è già

export default function PlayerCard({
    player,
    myTurn = true,
    disabled = false,
    size = 'sm', // 'sm' per la griglia, 'lg' per l'animazione overlay
    reduced = false,
    modeShow = false
}) {

    const isLarge = size === 'lg';

    function overall(p) {
        if (!p) return 0;
        const sum = (p.velocita || 0) + (p.tecnica || 0) + (p.difesa || 0) + (p.attacco || 0);
        return Math.round(sum / 4);
    }

    // Configurazione stili dinamici (STILE FIFA / FC)
    const styles = {
        // Container: Gradiente scuro, bordo dorato sottile, ombreggiatura profonda
        container: isLarge
            ? 'w-full h-full rounded-[2rem] border-[3px] shadow-[0_20px_50px_rgba(0,0,0,0.5)]'
            : reduced
                ? 'w-32 h-36 rounded-xl border-[1px] shadow-md'
                : 'w-40 h-48 rounded-xl border-[1px] shadow-md',


        // Colori base della card (Normale vs Disabilitato)
        baseColors: modeShow
            ? 'bg-gradient-to-b from-slate-800 via-slate-900 to-black border-yellow-600/40 hover:border-yellow-400 hover:shadow-[0_0_15px_rgba(250,204,21,0.3)]'
           : disabled && !isLarge
            ? 'bg-slate-800 border-slate-600 opacity-50 grayscale cursor-not-allowed'
            : `bg-gradient-to-b from-slate-800 via-slate-900 to-black 
               border-yellow-600/40 hover:border-yellow-400 hover:shadow-[0_0_15px_rgba(250,204,21,0.3)]
               group`, // group serve per l'hover,

        // Gestione Avatar (Dimensione + Posizione)
        avatarContainer: isLarge
            ? 'w-44 h-44 mt-4 mb-2'
            : 'w-24 h-24 mt-3 mb-1',

        // Titolo (Nome Giocatore)
        titleSize: isLarge
            ? 'text-2xl tracking-tighter mb-1'
            : 'text-[15px] tracking-tight mb-0.5 leading-tight',

        // Badge Overall (Posizionato in alto a sinistra stile FUT)
        badge: isLarge
            ? 'text-4xl top-6 left-6'
            : 'text-[20px] top-1.5 left-1.5',

        // Stats Grid
        statsGrid: isLarge
            ? 'gap-x-6 gap-y-2 pb-6 pt-2 px-4'
            : 'gap-x-1 gap-y-0.5 pb-2 px-2',

        statLabel: isLarge ? 'text-[20px] tracking-widest opacity-60' : 'text-[10px] opacity-70',
        statValue: isLarge ? 'text-[30px]' : 'text-[15px]',

        cursor: (!isLarge && !disabled) ? 'cursor-pointer' : 'cursor-default'
    };

    return (
        <div className={`
                relative flex flex-col items-center text-center transition-all duration-300 ease-out overflow-hidden select-none
                ${styles.container}
                ${styles.baseColors}
                ${styles.cursor}
            `}
        >
            {/* SFONDO DECORATIVO (Linee sottili stile card) */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

            {/* OVERALL RATING (Stile FUT: In alto a sinistra) */}
            <div className={`absolute font-black text-yellow-400 z-10 flex flex-col leading-none items-center ${styles.badge}`}>
                <span>{overall(player)}</span>
                <span className={`uppercase text-slate-400 font-bold ${isLarge ? 'text-xs' : 'text-[6px]'}`}>OVR</span>
            </div>

            {/* AVATAR IMAGE */}
            <div className={`relative z-0 ${styles.avatarContainer} flex items-end justify-center transition-transform duration-300 ${!isLarge ? 'group-hover:scale-110' : ''}`}>
                {player.avatar ? (
                    <>
                        <img
                            src={`${player.avatar}?v=${Date.now()}`} // Assumo arrivi in base64, togli il prefisso se è un URL
                            alt={player.nickname}
                            className="w-full h-full object-contain drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]"
                        />
                        <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                    </>

                ) : (
                    // Fallback se non c'è immagine: Cerchio con iniziali ma stilizzato
                    <div className="w-full h-full bg-slate-700/50 rounded-full flex items-center justify-center border-2 border-slate-600 border-dashed text-slate-500 text-2xl">
                        {player.nickname.charAt(0).toUpperCase()}
                    </div>
                )}
                {/* Sfumatura sotto l'immagine per fonderla col nome */}

            </div>

            {/* INFO CONTAINER */}
            <div className="w-full flex flex-col flex-1 z-10 relative">

                {/* Nome Giocatore con linea dorata sotto */}
                <div className="w-full flex flex-col items-center justify-center relative">
                    <h3 className={`${styles.titleSize} font-bold text-white uppercase truncate w-full px-2 drop-shadow-md`}>
                        {player.nickname}
                    </h3>
                    <div className={`bg-gradient-to-r from-transparent via-yellow-600 to-transparent opacity-80 ${isLarge ? 'h-0.5 w-3/4 mb-2' : 'h-[1px] w-2/3 mb-1'}`}></div>
                </div>


                {/* STATS GRID */}
                {!reduced && (
                    <div className={`grid grid-cols-4 w-full mt-auto ${styles.statsGrid}`}>
                        {[
                            { label: 'VEL', val: player.velocita, col: 'text-yellow-300' }, // Uso giallo/bianco per stile FUT classico, o colori neon
                            { label: 'ATT', val: player.attacco, col: 'text-rose-400' },
                            { label: 'DIF', val: player.difesa, col: 'text-emerald-400' },
                            { label: 'TEC', val: player.tecnica, col: 'text-cyan-400' }
                        ].map((stat) => (
                            <div key={stat.label} className="flex flex-col items-center justify-end">
                                <span className={`${styles.statLabel} font-bold text-slate-400`}>{stat.label}</span>
                                <span className={`${styles.statValue} font-bold ${stat.col} drop-shadow-sm`}>{stat.val}</span>
                            </div>
                        ))}
                    </div>
                )}


            </div>

            {/* HOVER ACTION OVERLAY (Stile "Scan") */}
            {(!isLarge && myTurn && !disabled) && (
                <div className="absolute inset-0 z-20 bg-indigo-900/90 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-[2px] border-2 border-indigo-400/50 rounded-xl">
                    <span className="text-white text-[15px] font-black uppercase tracking-widest mb-1 flex items-center gap-1 animate-pulse">
                        Scegli <Zap size={12} className="text-yellow-400 fill-yellow-400" />
                    </span>
                    <div className="px-2 py-0.5 bg-indigo-500 rounded text-[15px] text-white font-bold">
                        CONFERMA
                    </div>
                </div>
            )}
        </div>
    );
}