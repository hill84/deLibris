import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { appEmail, appName } from '../../config/shared';

const AboutPage = props => (
  <div id="AboutPageComponent" className="reveal fadeIn slideUp">
    <Helmet>
      <title>{appName} | Chi siamo</title>
    </Helmet>
    <div className="container pad-v">
      <h1>Chi siamo</h1>
      <div className="text-justify text-left-sm">
        <p className="accent-text"><big>{appName} è un social network dedicato a chi ama i libri e la lettura.</big></p>
        <p>La nostra missione è aiutare i lettori a trovare e condividere i libri che amano, diffondendo la passione per la lettura e la letteratura.</p>
        <br />

        <h2>Alcune cose che puoi fare su {appName}</h2>
        <p>Iscrivendoti e consultando {appName} potrai trovare informazioni utili e interessanti su tantissimi libri, scambiare opinioni con altri lettori e vedere cosa pensano gli utenti, leggendo le loro recensioni e i loro giudizi. Su {appName} trovi le recensioni e i voti dati ai libri da altri utenti come te. Inoltre, se vuoi, puoi anche organizzare la tua libreria e tenere traccia delle tue letture, annotando lo stato di lettura e tante altre informazioni.</p>
        <p>Su {appName} puoi costruire e aggiornare il tuo profilo e vedere quello degli altri utenti, creare la tua libreria e la tua lista dei desideri, catalogare, recensire e votare i libri che leggi, consultare le librerie di altri utenti e seguirli. Insomma su {appName} puoi partecipare alla vita della community e contribuire ad arricchirla di contenuti, idee e iniziative.</p>
        <p><big>Se anche tu ami i libri, insomma, {appName} è casa tua.</big></p>
        <br />

        <h2>Alcune considerazioni sul progetto</h2>
        <p>{appName} è un progetto personale di <a href="http://www.giuseppegerbino.com">Giuseppe Gerbino</a>, nato dalla sua passione per i libri e sviluppato nel tempo libero, autofinaziandosi. Il progetto è attualmente in fase "beta", cioè aperto al pubblico ma ancora in una versione non definitiva: in questa fase il contributo degli utenti è indispensabile per testare l'applicazione, trovare e segnalare malfunzionamenti e bug e fornire commenti o pareri per migliorare l'esperienza utente. Se quindi {appName} ti piace e vuoi partecipare alla sua crescita puoi inviare i tuoi messaggi all'indirizzo <a href={`mailto:${appEmail}?subject=Biblo: commento utente`}>{appEmail}</a> o contribuire con una <Link to="/donations">donazione</Link> (bastano pochi euro).</p>
      </div>
    </div>
  </div>
);

export default AboutPage;