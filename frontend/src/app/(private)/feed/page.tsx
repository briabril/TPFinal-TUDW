import React from 'react'
import ListaPosts from '@/components/ListaPosts'

export default function userFeed() {
    return (
        <div style={{ padding: 16 }}>
            <h1>Mi feed</h1>
            <ListaPosts mineOnly />
        </div>
    )
}