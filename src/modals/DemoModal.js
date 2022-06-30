import React, { useState } from 'react'
import ModalVideo from 'react-modal-video'
import "react-modal-video/scss/modal-video.scss";

export default function DemoModal() {
    const [isOpen, setOpen] = useState(false)

    return (
        <React.Fragment>
            <ModalVideo channel='youtube' autoplay isOpen={isOpen} videoId="pIuDQZ9xECc" onClose={() => setOpen(false)} />

            <button style={{ marginTop: '20px' }} className="btn-primary" onClick={() => setOpen(true)}>View Demo</button>
        </React.Fragment>
    );
}
