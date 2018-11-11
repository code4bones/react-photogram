import React, {Component} from 'react'
import {render} from 'react-dom'
import {Button,Modal,Select} from 'antd';
import 'antd/dist/antd.min.css';
import avatar from './avatar-placeholder.png';
import DatGuiAuto,{MutateObject} from './DatGuiAuto';
import Draggable from 'react-draggable';

import CameraView,{WithThumbnailsBox} from '../../src'
import './index.css';

/*
dialog
https://i.imgur.com/m6eocT4.png
dialog debug

https://i.imgur.com/WT2LBzw.png

inplace
https://i.imgur.com/IyGkGp6.png
debug
https://i.imgur.com/0TO7pRH.png
*/

const WithThumbnails = WithThumbnailsBox(CameraView);

const Preview = (props) => (
    <div className="preview">
        Resulting picture: ( {props.imageSize.width} x {props.imageSize.height} )<br/>
        {props.photo?
        <div>
            <div><img {...props.imageSize} src={props.photo} alt="Your photo here..."></img></div>
            {props.livePreview?
             <div>Live:<br/><img {...props.imageSize} src={props.stream} alt="Your photo here..."></img></div>
        :''}
        </div>
        :'...Snaphot here !'}
    </div>
)

const CameraWidth = (props) => {
    const render = () => {
        var arr = [240,320,360,420,480,560,640];
        return arr.map((i) => {
            return <Select.Option key={'k_'+i}  value={i}>{i}x{i*0.75}</Select.Option>
        });            
    }
    return (
        <span>Camera resolution:
        <Select defaultValue={props.cameraWidth} style={{width:120}} 
                onChange={props.onChange} >
                {render()}
        </Select>
        </span>
    )        
}


const commonProps = (parent,speceficOpts) => (
    {
        // output size
        outputSize:{
            width:'120px'
            ,height:'140px'
        }
        // thumbnail parameters
        ,thumbnailSize:{
                width:100,
                height:120,
                thumbsPerLine:3
        }
        // shutter sound
        ,mute:false
        // snapshot button position
        ,button:{
                vAlign:'bottom', // top,middle,bottom
                hAlign:'middle'  // left,middle,right
        }
         // dont remember crop box size and position 
         ,noLocalStorage:false   
        // key mappings for snaphot
        ,snapKeys:['Space','Enter']
        // thumbnail placeholder
        ,placeholder:avatar
        ,...speceficOpts
})

class InplaceWithThumbs extends Component {
    
    
    constructor(props) {
        super(props);
        this.options = commonProps(this);
        this.state = {
             photo:avatar
             ,imageSize:this.options.outputSize
             ,cameraWidth:480
             ,livePreview:true
             ,stream:avatar
        }
    }
    
    // fired then thumbnail is selected
    onSelectThumbnail = (item) => {
        this.setState({photo:item.image,imageSize:item.size});
    }
     
    // any internal error
    onError(error) {
        console.log(error);
        alert('error occured,check the console output...');
    }        
    
    onCameraWidthChange(value) {
        this.setState({cameraWidth:value});
    }
    
    onLivePreview(src) {
        this.setState({stream:src});
    }
    
        
    render() {
        return (
            <div style={{marginLeft:'10px',marginTop:'10px'}}>
                <h2>Inplace Camera view with thumbnails Box</h2>
                <CameraWidth cameraWidth={this.state.cameraWidth} onChange={this.onCameraWidthChange.bind(this)}/>
                <Preview {...this.state} />
                <div className="cameraHolder">
                    <WithThumbnails 
                        {...this.options}
                        cameraWidth={this.state.cameraWidth}
                        onError={this.onError.bind(this)}
                        onSelectThumbnail={this.onSelectThumbnail.bind(this)}
                        onLivePreview={this.onLivePreview.bind(this)}
                    >
                    {this.props.children}
                    </WithThumbnails>
                </div>
            </div>
            
        )
    }
}


class ModalWithThumbs extends Component {
    
    constructor(props) {
        super(props);
        this.options = commonProps(this,{title:'Modal',mute:false});
        this.state = {
             photo:avatar
            ,imageSize:this.options.outputSize
            ,cameraWidth:320
        }
    }
    
    // fired then thumbnail is selected
    onSelectThumbnail = (item) => {
        this.setState({photo:item.image,imageSize:item.size});
    }
     
    // any internal error
    onError(error) {
        console.log(error);
        alert('error occured,check the console output...');
    }        
    
    onSizeAdjusted(size) {
       this.setState({dialogWidth:size.width+15,dialogHeight:size.height+40});
    }
    
    showDialog() {
        this.setState({visible:true});
    }
        
    onOk() {
        this.setState({visible:false});
    }

    onCancel() {
        this.setState({visible:false});
    }
    
    
    onCameraWidthChange(value) {
        this.setState({cameraWidth:value});
    }
    
    
    render() {
        const title = () => {
            return `${this.options.title} : ( ${this.state.cameraWidth}x${this.state.cameraWidth*0.75} -> ${this.state.imageSize.width}x${this.state.imageSize.height} )`;
        }
        return (
            <div style={{marginLeft:'10px',marginTop:'10px'}}>
                <h2>Modal Camera with thumbnails Box</h2>
                <CameraWidth cameraWidth={this.state.cameraWidth}
                             onChange={this.onCameraWidthChange.bind(this)}
                />
                &nbsp;
                <Button onClick={this.showDialog.bind(this)}>Take a picture</Button>
                <Modal 
                    bodyStyle={{height:this.state.dialogHeight}}
                    title={title()}
                    visible={this.state.visible}
                    onOk={this.onOk.bind(this)}
                    onCancel={this.onCancel.bind(this)}
                    destroyOnClose
                    width={this.state.dialogWidth}
                >
                    <div className="cameraHolder" id="camera">
                        <WithThumbnails 
                            {...this.options}
                            children={this.props.children} 
                            //
                            cameraWidth={this.state.cameraWidth}
                            // stream images to onLiveeHandler(src)
                            // default null
                            //onLivePreview={this.onLivePreview.bind(this)}
                            // allow to correct the dialog dimensions
                            onSizeAdjusted={this.onSizeAdjusted.bind(this)}
                            // handles any internal components errors
                            onError={this.onError.bind(this)}
                            // fired then user clicks on thumbnails
                            onSelectThumbnail={this.onSelectThumbnail.bind(this)}
                        >
                        </WithThumbnails>
                    </div>
                </Modal>
                <Preview imageSize={this.state.imageSize} photo={this.state.photo}/>
            </div>
            
        )
    }
}

class Simple extends Component {
    
    constructor(props) {
        super(props);
        this.options = commonProps(this);
        this.state = {
             photo:avatar
            ,imageSize:this.options.outputSize
            ,cameraWidth:320
            ,stream:avatar
            ,livePreview:true
        }
        
        
    }
    
    onImage(data) {
        this.setState({photo:data.output.dataURL});
    }
    
    onCameraWidthChange(value) {
        this.setState({cameraWidth:value});
    }
    
    onLivePreview(src) {
        this.setState({stream:src});
    }
    
    render() {
        return (
            <div style={{marginLeft:'10px',marginTop:'10px'}}>
                <h2>Simple Camera view</h2>
                <CameraWidth cameraWidth={this.state.cameraWidth} onChange={this.onCameraWidthChange.bind(this)}/>
                <Preview {...this.state} />
                <div className="cameraHolder">
                <CameraView
                    {...this.options}
                    cameraWidth={this.state.cameraWidth}
                    onImage={this.onImage.bind(this)}
                    onLivePreview={this.onLivePreview.bind(this)}
                />
                </div>
            </div>
        )
    }
}

///////////////////////////////////////
class Demo extends Component {
    render() {
        return (
            <Simple />
        )
    }
}

render(<Demo/>, document.querySelector('#demo'))
