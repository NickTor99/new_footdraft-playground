import {MoreVertical, Trash2, ChevronsLeftRightEllipsis, SquareUser} from "lucide-react";
import React, {useState} from "react";

export default function PlayerTab({player, onDelete, onBind, onCreateAvatar}){

    const [showMenu, setShowMenu] = useState(false)

    const member = player.memberDetails

    const overall = () => {
        if (!player) return 0;
        const sum = (player.velocita || 0) + (player.tecnica || 0) + (player.difesa || 0) + (player.attacco || 0);
        return Math.round(sum / 4);
    }

    return(

        <>
            {showMenu && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowMenu(false)}
                    />

                    <div className="grid absolute right-48 mt-4 w-32 bg-white rounded-2xl border border-slate-100 shadow-xl z-20 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                        <button
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                            onClick={() => onDelete(player.playerid)}
                        >
                            <Trash2 size={16}/>
                            Elimina
                        </button>

                        <button
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-green-500 hover:bg-red-50 transition-colors"
                            onClick={onBind}
                        >
                            <ChevronsLeftRightEllipsis size={16}/>
                            Accoppia
                        </button>

                        <button
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-blue-500 hover:bg-red-50 transition-colors"
                            onClick={onCreateAvatar}
                        >
                            <SquareUser size={16}/>
                            Avatar
                        </button>
                    </div>
                </>

            )}

            <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                        <span className="bg-yellow-600 text-white px-2 py-1 rounded-lg font-black text-xs">{overall()}</span>
                        {player.avatar?
                            <img src={`${player.avatar}?v=${Date.now()}`} alt="Img" width={48} height={48} className='rounded-full' />
                            :
                            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                                <span className="text-xl">{player.nickname.charAt(0)}</span>
                            </div>
                        }

                        <span className="font-bold text-slate-800">{player.nickname}</span>
                    </div>
                </td>
                <td className="px-8 py-4 text-center">
                    <span className="bg-slate-900 text-white px-2 py-1 rounded-lg font-black text-xs">{player.attacco}</span>
                </td>
                <td className="px-8 py-4 text-center">
                    <span className="bg-slate-900 text-white px-2 py-1 rounded-lg font-black text-xs">{player.difesa}</span>
                </td>
                <td className="px-8 py-4 text-center">
                    <span className="bg-slate-900 text-white px-2 py-1 rounded-lg font-black text-xs">{player.velocita}</span>
                </td>
                <td className="px-8 py-4 text-center">
                    <span className="bg-slate-900 text-white px-2 py-1 rounded-lg font-black text-xs">{player.tecnica}</span>
                </td>
                <td className="px-8 py-4 text-center">
                    <span className="bg-slate-900 text-white px-2 py-2 rounded-lg font-black text-xs">{member? member.username: 'Nessuno'}</span>
                </td>
                <td className="px-8 py-4 text-right">
                    <button
                        className="text-slate-300 hover:text-blue-600"
                        onClick={() => setShowMenu(true)}
                    >
                        <MoreVertical size={18} />
                    </button>
                </td>
            </tr>

        </>


    )
}