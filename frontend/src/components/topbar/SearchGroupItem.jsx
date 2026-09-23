import {closeSearchGroupMenu} from "../../redux/seachGroupSlice.js";
import {ArrowRight, Globe, Lock, Users} from "lucide-react";
import {Link} from "react-router-dom";
import React from "react";
import {useDispatch} from "react-redux";



export default function SearchGroupItem({group, onReset}){
    const dispatch = useDispatch()
    return(
        <Link to={'/search/'+group.groupid}>
            <button
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-blue-50/50 transition-all text-left group/item"
                onClick={
                    () => {
                        onReset()
                        dispatch(closeSearchGroupMenu())
                    }
                }
            >
                <div className="flex items-center gap-3">
                    {/* Group Icon/Initial */}
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs group-hover/item:bg-blue-100 group-hover/item:text-blue-600 transition-colors">
                        {group.groupname.charAt(0).toUpperCase()}
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-slate-700 group-hover/item:text-blue-700 transition-colors">
                                            {group.groupname}
                                            </span>
                            {group.isprivate ? (
                                <Lock size={12} className="text-slate-300" />
                            ) : (
                                <Globe size={12} className="text-slate-300" />
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                                            <Users size={10} /> {group.currentpeople || 0} membri
                                            </span>
                            <span className="text-[10px] text-slate-300">•</span>
                            <span className="flex items-center gap-0.5 text-[10px] text-slate-400 font-medium italic">
                                                {group.category || 'General'}
                                            </span>
                        </div>
                    </div>
                </div>

                <ArrowRight
                    size={14}
                    className="text-slate-300 opacity-0 group-hover/item:opacity-100 group-hover/item:text-blue-500 -translate-x-2 group-hover/item:translate-x-0 transition-all"
                />
            </button>
        </Link>
    )
}