import React from "react";

export default function BindPlayer({members, players, playerId, onBind}){

    const linkedMembers = players.filter((p) => p.linckeduserid !== undefined).map((p) => p.linckeduserid.id)

    const membersToShow = members.filter((m) => !linkedMembers.includes(m.id))

    console.log(membersToShow)



    return(
        <>
            {membersToShow.map(member => (
                <button onClick={() => onBind(playerId, member.id)}>
                    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <img src={member.imageurl} alt="Img" width={48} height={48} className='rounded-full'/>
                            <div>
                                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                    {member.username}
                                </h4>

                            </div>
                        </div>

                    </div>
                </button>

            ))}
        </>

    )
}