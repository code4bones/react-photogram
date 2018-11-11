import React,{Component} from 'react';
import PropTypes from 'prop-types';
import './CameraView.css'
import { Rnd } from 'react-rnd';
import { Button } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';
import shutter_mp3 from './shutter.mp3';
import shutter_ogg from './shutter.ogg';
import 'antd/dist/antd.min.css';
//import DebugConsole from './DebugConsole';


/*
const debugConsole = new DebugConsole({
     maxRows:20
    ,stacked:true
    ,prettyPrint:true
    ,patch:['error','log','debug']
    ,hotKeys:['`']
});
*/

const FloatMenu = props => { 
    return (
       <div className="floatMenu" ref={props.menuRef}>
          <Button inverted color='orange' circular icon={props.mode} onClick={props.onClick} />
        </div>
    )
}

export default class CameraView extends Component {
    
      
    rndStyle = {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "dashed 2px #ddd",
      zIndex:999
    };
    
    
    constructor(props) {
        super(props);

        var state = {
             mode:'camera'
            ,outputSize:props.outputSize
            ,cameraWidth:props.cameraWidth
            ,videoWidth:props.cameraWidth
            ,videoHeight:props.cameraWidth * 0.75
        }
        
        
        var info = this.load();
        
        this.rndDefault = info?info.crop:{
                    x: ((state.videoWidth / 2) / 2)+5,
                    y: 5,
                    width: ((state.videoWidth / 2) ) - 10,
                    height: state.videoHeight - 10
        }
       
        state.rnd  = {
            position: {
                x:this.rndDefault.x,
                y:this.rndDefault.y
            },
            size: {
                width:this.rndDefault.width,
                height:this.rndDefault.height
            }
        }
        
        this.state = state;
        
        this.cut = this.rndDefault;
        
        console.log("Video",this.state);
        
        this.onFloatClick = this.onFloatClick.bind(this);
        this.onDragStop = this.onDragStop.bind(this);
        this.onResizeStop = this.onResizeStop.bind(this);
        this.onDrag = this.onDrag.bind(this);
        this.onResize = this.onResize.bind(this);
        
        this.videoRef = React.createRef();
        this.videoWrapRef = React.createRef();
        this.videoDivRef = React.createRef();
        this.holeRef = React.createRef();
        this.menuRef = React.createRef();
        this.imgSnapRef = React.createRef();
        this.cropAreaRef = React.createRef();
        this.rndFlash = React.createRef();
    }        
    
    
    componentDidMount() {
        document.body.addEventListener('keyup',this.onKeyUp) 
        
        this.srcCanvas = document.createElement("CANVAS");
        this.dstCanvas = document.createElement("CANVAS");
        this.cropCanvas = document.createElement("CANVAS");
        
        this.calcSize(this.state);
        this.start();
        this.setState({outputSize:this.props.outputSize});
        
        console.log("CameraView:",this.props);
        
    }

    componentWillUnmount() {
        document.body.removeEventListener('keyup',this.onKeyUp);
        this.stop();
    }
    
    resetCrop(stateOrProp) {
        var rnd = {
            position:{
                 x: ((stateOrProp.videoWidth / 2) / 2)+5
                ,y: 5
            }
            ,size: {
                width: ((stateOrProp.videoWidth / 2) ) - 10,
                height: stateOrProp.videoHeight - 10
            }
        }
        
        
        this.setState({rnd:rnd});
    }
    
    componentDidUpdate(prevProps,prevState,snap) {
        
        if ( prevProps.outputSize.width !== this.props.outputSize.width ||
             prevProps.outputSize.height !== this.props.outputSize.height ) {
            this.setState({outputSize:this.props.outputSize});
            this.calcSize(this.props);
        }
          
        if ( prevProps.cameraWidth !== this.props.cameraWidth ) {
            var state = { ...this.state,cameraWidth:this.props.cameraWidth
                       ,videoWidth:this.props.cameraWidth
                       ,videoHeight:this.props.cameraWidth * 0.75};

            this.setState(state);
            this.calcSize(state);
            this.resetCrop(state);
            this.stop();
        }
    }
    
    flash() {
        console.error("flash is error !");
        console.warn("Hello WARINNG !");
        //throw new Error('test');

        var rnd  = this.rndFlash.current;
        rnd.classList.add("flash");
        try {
            if ( !this.props.mute ) {
                var shutter = new Audio();
                shutter.autoplay = false;
                shutter.crossOrigin = 'anonymous';
                shutter.src = navigator.userAgent.match(/Firefox/) ? shutter_ogg : shutter_mp3;
                shutter.play();
            }
        } catch ( e ) {
            this.props.onError(e);
        }
        setTimeout(()=>{
            rnd.classList.remove("flash");
        },80);
    }
    
    takePhoto(doSnapshot) {
        
        //console.log("takePhoto",this);
        
        var video = this.videoRef.current;
        var snapImg = this.imgSnapRef.current;

        if ( video.videoHeight === 0 ||
             video.videoWidth === 0 ) {
                this.props.onError(new Error("<video> element has no videoHeight/videoWidth..."));
                return;
             }
        
        this.srcCanvas.height = video.videoHeight; 
        this.srcCanvas.width  = video.videoWidth; 
        
        var srcCtx = this.srcCanvas.getContext('2d');
        var dstCtx = this.dstCanvas.getContext('2d');
        var cropCtx = this.cropCanvas.getContext('2d');
        
        this.cropCanvas.height = this.cut.height; 
        this.cropCanvas.width  = this.cut.width; 
        
        srcCtx.drawImage(video,0,0,this.state.videoWidth,this.state.videoHeight);
       
        dstCtx.drawImage(this.srcCanvas,this.cut.x,this.cut.y,this.cut.width,this.cut.height,0,0,snapImg.clientWidth,snapImg.clientHeight);
        cropCtx.drawImage(this.srcCanvas,this.cut.x,this.cut.y,this.cut.width,this.cut.height,0,0,this.cut.width,this.cut.height);
        
        var crepArea = this.cropAreaRef.current;
        var hole = this.holeRef.current;
        crepArea.style.left = this.cut.x + 'px';
        crepArea.style.top = this.cut.y + 'px';
        crepArea.style.width = this.cut.width + 'px';
        crepArea.style.height = this.cut.height + 'px';
        
        
        crepArea.height = this.cut.height;
        crepArea.width  = this.cut.width; 
        
        var pCtx =  crepArea.getContext('2d');
        pCtx.drawImage(this.cropCanvas,0,0,this.cut.width,this.cut.height,
                                       0,0,this.cut.width,this.cut.height);
        
        if ( this.props.onLivePreview )
            this.props.onLivePreview(this.dstCanvas.toDataURL('image/png'));

        if ( doSnapshot === true && this.props.onImage ) {
            var url = this.dstCanvas.toDataURL('image/png');
            this.props.onImage({
                 crop: {
                     dataURL:this.cropCanvas.toDataURL('image/png')
                    ,size: {
                        width:this.cut.width
                        ,height:this.cut.height
                    }
                 }
                 ,output:{
                       dataURL:url
                      ,size:{width:this.state.outputSize.width
                             ,height:this.state.outputSize.height
                        }
                 }
            });
        }
    }
    
    calcSize(stateOrProp) {
        
        var wrapDiv = this.videoWrapRef.current;
        var wrap = wrapDiv.style;
        var videoDiv = this.videoDivRef.current.style;
        var hole = this.holeRef.current.style;
        var snapImg = document.getElementById("snapImg");
        
        snapImg.style.width  = stateOrProp.outputSize.width;
        snapImg.style.height = stateOrProp.outputSize.height;
        
        this.dstCanvas.height = snapImg.clientHeight;
        this.dstCanvas.width  = snapImg.clientWidth;
        
        
        var startX = stateOrProp.videoHeight / 2 /2; 
        
        wrap.width = (stateOrProp.videoHeight) + 'px';
        wrap.height = (stateOrProp.videoHeight) + 'px';
        
        videoDiv.left = -startX + 'px'; 
        
        hole.left = startX + 'px';
        hole.width = (stateOrProp.videoHeight) + 'px';

        this.adjustMenu(stateOrProp);
        if ( this.props.onSizeAdjusted )
            this.props.onSizeAdjusted({
                x:wrapDiv.offsetLeft,
                y:wrapDiv.offsetTop,
                width:wrapDiv.clientWidth,//shotsDiv.offsetLeft + shotsDiv.clientWidth,
                height:wrapDiv.clientHeight
            });
    }
    
    adjustMenu(stateOrProp) {
        var wrap = this.videoWrapRef.current.style;
        var wrapDiv = this.videoWrapRef.current;
        var menu = this.menuRef.current;
        var width  = menu.clientWidth;
        var height = menu.clientHeight+5;
        var align = this.props.button;
        var menuX,menuY;
        var startX = ((stateOrProp.videoHeight/*Width / 2*/) / 2);
        
        if ( align.hAlign === 'right' )
            menuX = (parseInt(wrap.width,10) - width ) - 5;
        else if ( align.hAlign === 'left' )
            menuX = 5;
        else
            menuX = startX - width / 2;

        if ( align.vAlign === 'top' )
            menuY = 5;
        else if ( align.vAlign === 'middle' )
            menuY = stateOrProp.videoHeight / 2 - height / 2;
        else 
            menuY = stateOrProp.videoHeight - height - 5;
        
        menu.style.left = menuX + 'px'; 
        menu.style.top  = menuY + 'px'; 
    }
    
    onKeyUp = (e) => {
        if ( this.props.snapKeys.indexOf(e.code) !== -1 ) {
            this.takePhoto(true);
            this.flash();
        }
    };
    
    
    
    onDragStop(ev,info) {
        this.cut.x = info.x;
        this.cut.y = info.y;
        this.setState({rnd:{position:{x:info.x,y:info.y}}});
        this.save();
    }
    
    onDrag(ev,info) {
        this.onDragStop(ev,info);
        this.takePhoto();
    }
    
    onResize(ev,dir,ref,delta,pos) {
        this.onResizeStop(ev,dir,ref,delta,pos);
        this.takePhoto();
    }
    
    onResizeStop(ev,dir,ref,delta,pos) {
        this.cut.x = pos.x;
        this.cut.y = pos.y;
        this.cut.width = ref.clientWidth; //style.width;
        this.cut.height = ref.clientHeight;//style.height;
        this.save();
        this.setState({rnd:{position:pos,size:{width:this.cut.width,height:this.cut.height}}});
    }
    
    getConfName() {
        return `${this.props.storeName}_Crop_${this.state.videoWidth}x${this.state.videoHeight}`;
    }
    
    save() {
        global.localStorage.setItem(this.getConfName(),JSON.stringify({
            crop:this.cut
        }));
        
    }
    
    load() {
        if ( this.props.noLocalStorage )
            return null;
        try {
            var info = JSON.parse(global.localStorage.getItem(this.getConfName()));
            if ( info )
                return info;
        } catch (e) {
            
        }
        return null;
    }
    
    onFloatClick(ev,el) {
        this.takePhoto(true);
        this.flash();
    }
    
    onPlaying = () => {
        this.timerID = setInterval(() => {
            this.takePhoto(false);
        },this.streamVideo,this.props.refreshRate);
    }
    
    stop() {
        var video = this.videoRef.current;
        //this.takePhoto();
        
        clearInterval(this.timerID);
        video.pause();
        if ( this.stream.getVideoTracks ) {
            for ( var track of this.stream.getVideoTracks()) 
                track.stop();
        }
        console.log("Unmounted");
    }

    start() {
        var video = this.videoRef.current;
        var self = this;
        video.crossOrigin = 'anonymous';
        
        navigator.mediaDevices.getUserMedia({
            audio:false,
            video:true
        })
        .then((stream)=>{
            self.stream = stream;
            video.srcObject = stream;
            video.onloadedmetadata = (e) => {
                video.play();
            }
        })
        .catch((e)=>{
            this.props.onError(e);
        });
    }
    
    render() {
        return(
            <div className="cameraView" id="cameraView" style={this.props.style}>
                <div className="videoWrap" ref={this.videoWrapRef} id="videoWrap"
                style={{width:this.state.videoHeight,height:this.state.videoHeight}}
                >
                    <FloatMenu onClick={this.onFloatClick} menuRef={this.menuRef} mode={this.state.mode}/>
                    <div className="videoDiv" ref={this.videoDivRef}>
                     
                        <video id="sourcevid"
                               ref={this.videoRef}
                               className='dimmer'
                               //autoPlay 
                               width={this.state.videoWidth} 
                               height={this.state.videoHeight} 
                               //onLoadedMetadata={this.onLoadedMetadata}
                               onPlaying={this.onPlaying}
                               //onAbort={this.onSuspend}
                               crossOrigin="anonymous"
                               >
                                Sorry, you're browser doesn't support video...
                        </video>
                            <canvas className={this.state.mode==='crop'?'crop-area no-preview':'crop-area'} ref={this.cropAreaRef}></canvas>
                        <div className='hole' ref={this.holeRef}>
                            {this.state.mode!=='crop'?
                            <div className='preview-dimmer'></div>:''}
                        </div>
                         <Rnd   
                            position={this.state.rnd.position}
                            size={this.state.rnd.size}
                            style={this.rndStyle}
                            default={this.rndDefault}
                            onDragStop={this.onDragStop}
                            onResizeStop={this.onResizeStop}
                            onResize={this.onResize}
                            onDrag={this.onDrag}
                            lockAspectRatio={this.props.lockAspectRatio}
                            bounds={'.hole'}
                        >
                            <div className='rndFlash' ref={this.rndFlash}></div>
                        </Rnd>
                    </div>
                </div>
                <img id="snapImg" src="" className="snapImg" ref={this.imgSnapRef}/>
                {this.props.children}
            </div>
        )
    }
}

CameraView.defaultProps = {
     cameraWidth:360
    ,storeName:'Photogram'
    ,mute:false
    ,outputSize:{
         width:'320px'
        ,height:'400px'
    }
    ,debug:false
    ,menu:{valign:'bottom',halign:'middle'}
    ,lockAspectRatio:false
    ,noLocalStorage:false    
    ,resetOnClose:false
    ,snapKeys:['Space','Enter']
    ,refreshRate:50
    ,onError:function(e) {
        console.error('PhotoSnapshot error => ',e);        
        var msg = document.getElementById("errorMessage");
        if ( msg === null ) {
            msg = document.createElement("div");
            msg.className = "errorMessage";
            msg.id = "errorMessage";
            msg.setAttribute("count",1);
            document.body.appendChild(msg);
        }
        var count = parseInt(msg.getAttribute("count")) + 1;
        msg.setAttribute("count",count);
        msg.innerText = `(${count}) ${e}`;
    }
}

CameraView.propTypes = {
      cameraWidth: PropTypes.number.isRequired
     ,outputSize: PropTypes.shape({
        width:PropTypes.oneOfType([PropTypes.string.isRequired,PropTypes.number.isRequired]),
        height:PropTypes.oneOfType([PropTypes.string.isRequired,PropTypes.number.isRequired])
    })
     ,storeName: PropTypes.string
     ,noLocalStorage: PropTypes.bool
     ,menu: PropTypes.shape({
        vAlign:PropTypes.oneOf(['top','middle','bottom'])
        ,hAlign:PropTypes.oneOf(['left','middle','right'])
     })
     ,onImage:PropTypes.func.isRequired
     ,mute:PropTypes.bool
     ,debug:PropTypes.bool
     ,lockAspectRatio:PropTypes.bool
     ,noLocalStorage:PropTypes.bool
     ,snapKeys:PropTypes.array
     ,refreshRate:PropTypes.number
     ,onError:PropTypes.func
}


