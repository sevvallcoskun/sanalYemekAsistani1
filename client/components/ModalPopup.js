import { View, Text, Modal, Dimensions, TouchableWithoutFeedback, StyleSheet } from 'react-native'
import React from 'react'

const deviceHeight=Dimensions.get('window').height;
export class ModalPopup extends React.Component {
    constructor(props) {
        super(props);
    }
    show=()=>{
        this.setState({show:true})
    }
    close=()=>{
        this.setState({show:false})
    }
    renderOutsideTouchable() {
        const view= <View style={{flex:1, width:'100%'}}/>
        if (!onTouch) return view; 
        return(
            <TouchableWithoutFeedback onPress={onTouch} style= {{flex:1, width:'100%'}}>
                {view}
            </TouchableWithoutFeedback>
        )
    }
    render() {
        let {show} = this.state;
        const {onTouchOutside, title}= this.props;
        return (
            <Modal
                animationType={"fade"} 
                transparent= {true}
                visible={show}
                onRequestClose= {this.props.onClose}
            >
                <View style= {{
                    flex:1, 
                    backgroundColor:'#000000AA', 
                    justifyContent:'flex-end'}}
                >
                    {this.renderOutsideTouchable(onTouchOutside)}
                    <View style= {{
                        backgroundColor:  '#ffffff', 
                        width:'100%',
                        borderTopLeftRadius:20,
                        borderTopRightRadius:20,
                        paddingHorizontal:10,
                        maxHeight:deviceHeight*0.4
                    }}>
                        <View>
                            <Text style={{
                                color: 'black', 
                                fontSize: 20,
                                fontWeight: '500',
                                margin:15
                            }}>
                                {title}
                            </Text>
                        </View>
                    </View>
                </View>
            </Modal>
  
        )
    }
}