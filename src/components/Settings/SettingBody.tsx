import { SettingGeneral } from './SettingGeneral'
import { SettingSecurity } from './SettingSecurity'
import { SettingExternal } from './SettingExternal'

export const SettingBody = () => {
    return (
        <div className="body-page d-flex py-xl-3 py-2">
            <div className="container px-0">
                <Row />
                <div className="tab-content">
                    <SettingGeneral />

                    <SettingSecurity />
                    <SettingExternal />
                </div>
            </div>
        </div>
    )
}
const Row = () => {
    return (
        <div className="row">
            <div className="col-12">
                <ul className="nav nav-tabs nav-overflow page-header-tabs mb-4 mt-md-5 mt-3">
                    <NavItem state="active" href="#setting-general" text="常规" />
                    <NavItem state="" href="#setting-security" text="安全" />
                    <NavItem state="" href="#setting-external" text="外部服务" />
                </ul>
            </div>
        </div>
    )
}
const NavItem = ({ state, href, text }: { state: string; href: string; text: string }) => {
    return (
        <li className="nav-item">
            <a className={'nav-link ' + state} data-toggle="tab" href={href} role="tab">
                {text}
            </a>
        </li>
    )
}
