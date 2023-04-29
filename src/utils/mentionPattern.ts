import { action } from 'mobx'
import { userStore } from '../stores/userStore'

const re = /(?<=@)([^@]+?)\(([0-9]+)\)(?=\s)/g
export const mentionTester = new RegExp(re)

export const getUserIds = action((text: string) => {
    const userIds: number[] = []
    let match
    while ((match = mentionTester.exec(text)) !== null) {
        try {
            const userId = parseInt(match[2])
            userStore.getUser(userId).originName === match[1] &&
                userIds.indexOf(userId) === -1 &&
                userIds.push(userId)
        } catch {
            continue
        }
    }
    console.log(userIds)
    return userIds
})
