import { observer } from 'mobx-react-lite'
import { SettingHead } from './SettingHead'
import { SettingBody } from './SettingBody'

export const Settings = observer(() => {
    return (
        <div className={'main px-xl-5 px-lg-4 px-3 '}>
            <div className="main-body">
                <SettingHead/>
                <SettingBody/>
            </div>
        </div>
    )
})