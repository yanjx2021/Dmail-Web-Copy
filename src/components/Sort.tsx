import React, { Component, useEffect, useState } from 'react'
import Message from './Message'
import { pinyin } from 'pinyin-pro'

export interface FriendInf {
    user: string
    lastime: string
    color?: string
}
