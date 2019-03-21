import LogRocket from 'logrocket';

export default logRocketID => {

  if(!logRocketID) return;
 
  document.getElementById('btnLogRocket').onclick = e => {

    //console.log(e.target);
  
    LogRocket.init(logRocketID);
  
    if (document.body.dataset.user) LogRocket.identify(document.body.dataset.user);
   
  };

};