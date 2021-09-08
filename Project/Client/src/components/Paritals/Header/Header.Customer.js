import { CartButton } from "../../Controls"
import { SearchHeaderInput } from "../../Controls"
import {SearchIcon, TimesIcon } from "../../Controls/FlatIcon"
import { useState } from "react"
import { useHistory } from 'react-router'
import "./Header.Style.scss"
const Header = ({children,...rest}) => {
    const history  = useHistory()
    return (
        <div className="Header">
            <div className="header-wrapper">
                <div className="header-logo">
                    <p onClick={()=>history.push('/')}>Octopus.com</p>
                </div>
                {children}
                
            </div>
        </div>
    )
}
// export default Header;
export const MainHeader =({...rest})=>{
    return(
        <Header {...rest}>
            <div className="header-cart">
                    <CartButton amount ="10" handle={()=>console.log("hello")}/>
            </div>
        </Header>
    )
}
export const SearchHeader =({...rest})=>{
    const [state, setstate] = useState(false)
    const history  = useHistory()
    const searchHandle = (entry) =>{
        if(entry.trim().length===0) return;
        history.push(`/search/${entry}`)
    }
    return (
        <>
        <input onClick={()=>setstate(!state)} type="checkbox" id="search_header_check"/>
        <Header {...rest}>
            <SearchHeaderInput searchHandle={searchHandle}/>
            <label className="searchsortcut" htmlFor="search_header_check">{state?<TimesIcon/>:<SearchIcon/>} </label>
            <div className="header-cart">
                    <CartButton amount ="10" handle={()=>console.log("hello")}/>
            </div>
        </Header>
        </>
    )
}

export const AdminHeader =({...rest})=>{
    return(
        <Header>
        <div className="header-admin">
            <div className="header-admin-panel">
                <label>Xin chào <span> Admin name </span></label>
                <div className="admin-control-panel">
                    <div className="panel">
                        <button>Thông tin</button>
                        <button>Đổi mật khẩu</button>
                        <button>Thoát</button>
                    </div>
                </div>
            </div>
        </div>
    </Header>
    )
}

