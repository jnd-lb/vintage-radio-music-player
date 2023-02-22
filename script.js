let click = new Audio('./audio/click2.mp3');

let repeat = false;
let volume = 10;

let isPlaying = false;
let isShuffle = false;

let currentTrackIndex = -1;

let playlist = []
let tuningIndex = 1;
let track = new Audio();
let tuning = 
    [
        new Audio(`./audio/tuning1.mp3`),
        new Audio(`./audio/tuning2.mp3`),
        new Audio(`./audio/tuning3.mp3`),
    ]
$(document).ready(function(){



    $.ajax({
        type: 'GET',
        url: "https://raw.githubusercontent.com/jnd-lb/radio-music-api/main/data.json",
        dataType: 'json',
        success: function (data) { 
           playlist =  data
           setCurrentlyPlaying(0)
           $(".playing-now").removeClass('hide')
        }
    }).done(function(data) {
        setPlayList(data)
      });

    $(".button").click(function(e){
        $(this).toggleClass('clicked')
        click.play()
    })

    $('.channel-change-js').click(function(e){
        playTuningNoise()
    })

    $("ul").on('click','li', function(event){
        const trackIndex = $(this).data('index')
        playTrack(trackIndex)
    });

    $('#repeat').click(function(event){
        repeat = !repeat;
    })


    $("#seekbar").change(function(event){
        seekTo()
    })
    

    $("#volume-up").click(function(event){
        if(volume==10) return 
        volume++
        track.volume =  volume/10;
        rotateVolume()
    })

    $("#stop").click(function(){
        stop()
        setTimeout(function(){
            $("#stop").removeClass('clicked')
        },300)
    })

    $("#volume-down").click(function(event){
        if(volume==0) return 
        volume--
        track.volume =  volume/10;
        rotateVolume(-1)
    })

    let volumeButtomRotation= 135
    const rotateVolume = function(sign=1){
        volumeButtomRotation = (sign*27)+volumeButtomRotation 
        $("#volume-dot").css('transform','rotate('+ volumeButtomRotation +'deg)');
    }

    let stationButtonRotation= -135

    const rotateStationButton = function(){


        let amountOfRotation = 270/(playlist.length-1)

        
        $("#station-dot").css('transform','rotate('+ ((amountOfRotation*(currentTrackIndex))-135) +'deg)');
    }

    const setPlayList= function(data){
        let list = "";
        data.forEach((track,index)=> {
            list+=`<li data-index="${index}">${track.title}</li>`
        });
        $(".tracks-list").html(list)
    }

    const setCurrentlyPlaying= function(index){

        let previousPlayedTrack = currentTrackIndex;

        currentTrackIndex=index;
        const track = playlist[index]

        rotateStationButton()
        //set album art
        $('.album-art').attr("src",track.album_art);

        //set song title
        $('#track-title').html(track.title);

        //set song singer name
        $('#singer-name').html(track.singer_name);

        console.log("prev",previousPlayedTrack)
        console.log("current",currentTrackIndex)
        $('ul li').each(function(index,item){
            if(index == previousPlayedTrack || index == currentTrackIndex) 
                $(this).toggleClass('active')

        })
        
    
    }

    const playTrack = function(index){
        playTuningNoise()
        setCurrentlyPlaying(index)
        isPlaying = true;
        track.src = playlist[index].audio
        track.load()
        track.play()
        if(!$("#play").hasClass("clicked")){
            click.play()
            $("#play").addClass("clicked")
        }

        setInterval(updateDetails,1000)
    }

    $("#play").click(function(){
        
        if(isPlaying){
            pause()
        }else{
            play()
        }

    })

    $('#shuffle').click(function(){
        isShuffle = !isShuffle
    })

    $('#next-track').click(function(){
        next()
    })

    $('#prev-track').click(function(){
        previous()
    })

    
    
    const pause = function(){
        isPlaying=false;
        track.pause()
    }

    const stop = function(){
        isPlaying=false;
        let playButton = $("#play")
        if(playButton.hasClass("clicked")){
            playButton.removeClass("clicked")
        }

        seekTo(0)
        if(track.duration){
            track.pause()
        }
    }

    const previous = function(){
        isPlaying=true
        if(currentTrackIndex  == -1 || currentTrackIndex == 0)
            playTrack(playlist.length-1)
        else
          playTrack(currentTrackIndex-1)
    }

    const next = function(){
        isPlaying=true
        if(isShuffle){
            playTrack(randomTrackIndex())
        }else{
            playTrack((currentTrackIndex+1)% playlist.length)
        }
    }

    const play = function(){
        //if there is a track already loaded
        if(track.duration){
            isPlaying=true
            track.play()
        }else{
            //if there is no track loaded, play the first track in the list
            if(playlist.length){
                playTrack(0)
            }else{
                alert("No tracks available")
            }
        }
        
    }


    const playTuningNoise = function(){
        console.log(tuning)
        tuning[tuningIndex%3].play()
        tuningIndex++;
    }


    const updateDetails = function(){
        let currentTime = Math.floor(track.currentTime*100/track.duration)
        if(!isNaN(currentTime)){
            $("#seekbar").val(currentTime)
        }

        if(track.ended){
           if(repeat){
            track.play()
           }else{
            next();
           }
        }
    }

    
    function seekTo(index=null){
        
        let time = 0
        
        if(index != null){
            time = track.duration * index / 100;
            $("#seekbar").val(index)
        }else{
            time = track.duration * ($("#seekbar").val() / 100);
        }

        track.currentTime = time;
    }
    

    function randomTrackIndex() {
        return Math.floor(Math.random()*10)%playlist.length; 
    }
})