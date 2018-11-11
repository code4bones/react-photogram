import React,{Component} from 'react';
import {Button,Modal,Switch} from 'antd';
import { Card,Image,Placeholder } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal-resizable-draggable';

const WithThumbnailsBox = (CameraView) => {
    
    return class extends React.Component {
        
    state = {
         visible:false
        ,items:[]
        ,selected:0
        ,outputSize:this.props.outputSize
        ,thumbnailSize:this.props.thumbnailSize
    };
    
    constructor(props) {
        super(props);
        
        this.onImage = this.onImage.bind(this);
       // this.onPreview = this.onPreview.bind(this);
        
        this.items = [];
        this.shotsPaneRef = React.createRef();
        this.videoRef = React.createRef();
        this.onSizeAdjusted = this.onSizeAdjusted.bind(this);
        this.snapImg = React.createRef();
        
        
    }        
    
    componentDidMount() {
        console.log("WithThumbnailsBox",this.props);
    }
    
    componentWillUnmount() {
        
    }
    
    componentDidUpdate(prevProps,prevState,snap) {
        if ( prevProps.visible !== this.props.visible ) {
            this.setState({visible:this.props.visible});
        }
        
        if ( prevProps.outputSize.width !== this.props.outputSize.width || 
             prevProps.outputSize.height !== this.props.outputSize.height ) {
             this.setState({outputSize:this.props.outputSize});
             //this.calcSize(this.adjInfo);
         }

        if ( prevProps.thumbnailSize.width !== this.props.thumbnailSize.width || 
             prevProps.thumbnailSize.height !== this.props.thumbnailSize.height || 
             prevProps.thumbnailSize.thumbsPerLine !== this.props.thumbnailSize.thumbsPerLine ) {
                this.setState({thumbnailSize:this.props.thumbnailSize});
                this.calcSize(this.adjInfo);
         }
    }
    
    initPreviewItemStyle(size) {
        var snapImg = this.snapImg.current;
        snapImg.style.width  = parseInt(size.width) + 'px'; 
        snapImg.style.height = parseInt(size.height) + 'px'; 
    
        this.previewItemStyle = {
            width:snapImg.clientWidth,
            height:snapImg.clientHeight
        }            
    }
    
    calcSize(camViewSize) {
        var paneDiv = document.getElementById("shotsPane");
        var cameraView = document.getElementById("cameraView");
        var videoWrap = document.getElementById("videoWrap");
        var shotsPane = document.getElementById("shotsPane");
        
        this.initPreviewItemStyle(this.state.thumbnailSize);
        
        
        paneDiv.style.left   = camViewSize.width + 5 + 'px';
        paneDiv.style.top    = camViewSize.y + 'px';
        paneDiv.style.height = camViewSize.height + 'px';

        
        var count = parseInt(this.state.thumbnailSize.thumbsPerLine);
        var width = count * (this.previewItemStyle.width +  15);
        paneDiv.style.width = 20 + width + 20 + 'px'; 
        
        var size = {
            width:videoWrap.scrollWidth + shotsPane.scrollWidth //parseInt(paneDiv.clientWidth,10)+camViewSize.x + camViewSize.width,
            ,height:Math.max(parseInt(paneDiv.offsetHeight,10),videoWrap.offsetHeight)
        }
        if ( this.props.onSizeAdjusted )
            this.props.onSizeAdjusted(size);
    }
    
    onImage(info) {
        var key= 'item_'+new Date().getTime();
        this.items.unshift({key:key,src:info.crop.dataURL});
        this.setState({items:this.items});
        if ( this.props.onUpdateThumbnails )
            this.props.onUpdateThumbnails(this.items);
    }        
    
    /*
    onLivePreview(src) {
        //console.log(src);
        if ( this.props.onLivePreview )
            this.props.onLivePreview(src);
    }
    */
    
    onSizeAdjusted = (camViewSize) => {
        this.adjInfo = camViewSize;
        this.calcSize(camViewSize);
    }        
    
    
    
    onRadioChange = (item) => {
        this.onThumbnailClick(item);
    }
    
    onThumbnailClick = (item) => {
        this.setState({selected:{value:item.key}});
        if ( this.props.onSelectThumbnail )
            this.props.onSelectThumbnail({image:item.src,size:this.state.outputSize});
    }
    
    onDelete(toRemove) {
        this.items = this.state.items.filter((item) => {
            return toRemove.key !== item.key;
        });
        if ( this.props.onUpdateThumbnails )
            this.props.onUpdateThumbnails(this.items);
        this.setState({items:this.items});
    }
    
    onAfterClose = () => {
    }
    
    
                           //image={item.src}
    renderItems = () => {
        return this.state.items.map((item) => {
            return <div className="previewItem" key={item.key} onClick={this.onThumbnailClick.bind(this,item)}>
                    <Switch name="items" value={item.key} 
                           checked={this.state.selected.value === item.key}
                           onChange={this.onRadioChange.bind(this,item)} 
                           className="previewToggle"
                           size="default"
                    />
                    <Button onClick={this.onDelete.bind(this,item)} 
                            size="small" type="danger" shape="circle" icon="close" className="previewClose" />
                    <Card style={this.previewItemStyle}>
                        <img src={item.src} height='100%' width='100%' className="previewImage" />
                    </Card>
                   </div>
        });
    }        
    
    render() {
        var size = {
            width: this.state.thumbnailSize.width,
            height: this.state.thumbnailSize.height
        };
        return (
            <div>
                {this.props.children}
                <img className="snapImg" ref={this.snapImg} alt=""/>
                <div>   
                    <CameraView {...this.props} 
                            
                            outputSize={this.state.outputSize}
                            onSizeAdjusted={this.onSizeAdjusted}
                            onImage={this.onImage}
                            ref={this.videoRef}>

                        <div id="shotsPane" className="shotsPane"  ref={this.shotsPaneRef}>
                            {this.state.items.length>0?
                            <Card.Group itemsPerRow={1}>
                                {this.renderItems()}
                            </Card.Group>
                            :<Placeholder style={size}>
                                <Placeholder.Image>
                                <img {...size} src={this.props.placeholder} />
                                </Placeholder.Image>
                            </Placeholder>}
                        </div>
                    </CameraView>
                </div>    
            </div>
        )} // render
    } // class
}

export default WithThumbnailsBox;

/*
PhotoDialog.defaultProps = {
     dialog:true
    ,visible:false
    ,cameraWidth:480
    ,outputSize:{
        width:'120px'
        ,height:'160px'
    }
    ,thumbnailSize:{
            width:100,
            height:120,
            photosPerLine:3
    }
    ,mute:false
    ,menu:{
            vAlign:'bottom', // top,middle,bottom
            hAlign:'middle'  // left,middle,right
    }
    ,noLocalStorage:false   
    ,resetOnClose:false
    ,snapKeys:['Space','Enter']
    ,okText:"Ok !"
    ,cancelText:"Cancel"
        
};

PhotoDialog.propTypes = {
     thumbnailSize: PropTypes.shape({
        width:PropTypes.oneOfType([PropTypes.string.isRequired,PropTypes.number.isRequired]),
        height:PropTypes.oneOfType([PropTypes.string.isRequired,PropTypes.number.isRequired])
    })
    ,parent:PropTypes.instanceOf(Component).isRequired
    ,visible:PropTypes.bool.isRequired
    ,onSelectThumbnail:PropTypes.func
    ,onOk:PropTypes.func
    ,onCancel:PropTypes.func
    ,okText:PropTypes.string.isRequired
    ,cancelText:PropTypes.string
}
*/

//export default ;
