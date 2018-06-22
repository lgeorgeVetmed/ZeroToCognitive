var extend = require('extend');
var watson = require('watson-developer-cloud');
var vcapServices = require('vcap_services');
var config = require('../../env.json');

exports.stt_token = function(req, res) {
    var sttConfig = extend(config.speech_to_text, vcapServices.getCredentials('speech_to_text'));

    var sttAuthService = watson.authorization(sttConfig);

    sttAuthService.getToken({
        url: sttConfig.url
    }, function(err, token) {
        if (err) {
            console.log('Error retrieving speech to text token: ', err);
            res.status(500).send('Error retrieving speech to text token');
            return;
        }
        res.send(token);
    });
}

exports.tts_synthesize = function(req, res) {
  console.log("tts_synthesize entered");
  // use the environment variables to configure text to speech
    var ttsConfig = watson.text_to_speech(config.text_to_speech);
    // give the synthesizer the data from the browser.
    // you may find that you get errors if you send in an empty text string. 
    // this can be avoided by testing req.query to see if it has any text in it
    // that would be a good exercise to extend this code
    var transcript = ttsConfig.synthesize(req.query);
    transcript.on('response', function(response) {
      if (req.query.download) {
        response.headers['content-disposition'] = 'attachment; filename=transcript.ogg';
      }
    });
    // if there's an error, log it to the server console window.
    transcript.on('error', function(error) { console.log("error encountered: "+error); next(error); });
    // pipe sends the sound as a stream (vs a downloaded file) back to the browser
    transcript.pipe(res);
}
