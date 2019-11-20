//import LogRocket from 'logrocket';

export default logRocketID => {

  if(!logRocketID) return;

  const btnLogRocket = document.getElementById('btnLogRocket');
 
  btnLogRocket.onclick = () => {

    if (confirm('Start LogRocket session?')) {

      btnLogRocket.classList.add('active');

      btnLogRocket.onclick = null;
  
      LogRocket.init(logRocketID);
  
      if (document.body.dataset.user) LogRocket.identify(document.body.dataset.user);

    }
   
  };

};