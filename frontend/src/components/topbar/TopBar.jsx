import React, {useEffect, useState} from "react";
import {setIsOpenSidebar} from '../../redux/mainPageSlice.js'
import {setSearchGroupMenu} from '../../redux/seachGroupSlice.js'
import { useSelector, useDispatch } from 'react-redux'
import {X, Menu, Search} from 'lucide-react'
import {searchGroups} from "../groups/api.js";
import SearchGroupMenu from './SearchGroupMenu.jsx';



function TopBar({user}){
    const isOpenSideBar = useSelector((state) => state.mainPageState.IsOpenSidebar)
    const dispatch = useDispatch()
    const [groups, setGroups] = useState([]);
    const [value, setValue] = useState("")
    const searchValue = useSelector((state) => state.searchGroup.searchValue)
    const viewGroups = useSelector((state) => state.searchGroup.viewGroups)

    useEffect(() => {
        if(searchValue.length >= 3){
            searchGroups(searchValue).then(data => setGroups([...data]));
        }
    }, [searchValue]);

    function onReset(){
        setValue("")
    }

    return(
        <header className="h-16 dark:bg-slate-800 bg-white border-b border-slate-100 flex items-center justify-between px-4 lg:px-8 shrink-0">
            <div className="flex items-center gap-4">
                {/* Mobile Menu Toggle */}
                <button
                    onClick={() => dispatch(setIsOpenSidebar())}
                    className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg"
                >
                    {isOpenSideBar ? <X /> : <Menu />}
                </button>

                {/* Search (Desktop) */}
                <div className="flex items-center relative w-full max-w-xs md:max-w-sm">
                    <Search className="absolute left-3 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Cerca gruppo o giocatore..."
                        className="bg-slate-50 border-none rounded-xl py-2 pl-10 pr-4 text-sm w-64 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        value={value}
                        onChange={(e) => {setValue(e.target.value); dispatch(setSearchGroupMenu(e.target.value)); }}
                    />
                    {
                        viewGroups && (
                            <SearchGroupMenu groups={groups} onReset={onReset}></SearchGroupMenu>
                        )
                    }

                </div>

            </div>

            <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold dark:text-slate-300 text-slate-800">{user.username}</p>
                    <p className="text-[10px] text-slate-400 font-medium">User ID: #12345</p>
                </div>
                <img src={user.imageurl} alt="Img" width={32} height={32} className='rounded-full' />
            </div>
        </header>
    )
}

export default TopBar