import React, { useState } from 'react'
import ModalVideo from 'react-modal-video'
import "react-modal-video/scss/modal-video.scss";

export default function DemoModal() {
    const [modal, setModal] = useState(false);
    const [isOpen, setOpen] = useState(false)

    const openModal = () => {
        setModal(!modal);
    };

    return (
        <div className="App">
            <button onClick={openModal} className="">
                Demo Tutorial
                {modal ? (
                    <React.Fragment>
                        <ModalVideo channel='youtube' autoplay isOpen={isOpen} videoId="L61p2uyiMSo" onClose={() => setOpen(false)} />

                        <button className="btn-primary" onClick={() => setOpen(true)}>VIEW DEMO</button>
                    </React.Fragment>
                ) : null}
            </button>
        </div>
    );
}

