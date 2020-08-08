"use strict";

import React, {ReactNode, FunctionComponent, PropsWithChildren, useState, useRef } from "react";
import {
    ScrollView,
    StyleSheet,
    TouchableWithoutFeedback,
    View,
    LayoutChangeEvent
} from "react-native";

type CarouselProps = {
    pageStyle?: object,
    containerStyle?: object,
    //onPageChange?(position: number, currentElement: ReactNode): void,
} & Partial<CarouselDefaultProps>;

type CarouselDefaultProps = {
    initialPage?: number | 'center',
    sneak?: number,
    vertical?: boolean,
    disabled?: boolean,
};

const Carousel: FunctionComponent<PropsWithChildren<CarouselProps>> = (props) => {
    const [currentPage, setCurrentPage] = useState(0);
    const [snapInterval, setSnapInterval] = useState(0);

    const [height, setHeight] = useState(0);
    const [width, setWidth] = useState(0);

    const scrollview = useRef<ScrollView>(null);

    if (scrollview.current != null) {
        let position = currentPage * snapInterval;
        if (props.vertical) {
            scrollview.current.scrollTo({ x: 0, y: position, animated: true })
        } else {
            scrollview.current.scrollTo({ x: position, y: 0, animated: true })
        }
    }

    const OnLayout = (event: LayoutChangeEvent) => {
        const layout = event.nativeEvent.layout;

        setHeight(layout.height);
        setWidth(layout.width);

        if (props.vertical) {
            setSnapInterval(layout.height - props.sneak!/2);
        } else {
            setSnapInterval(layout.width - props.sneak!/2);
        }
    }

    let computedStyles: any = null;

    if (props.vertical) {
        computedStyles = StyleSheet.create({
            content: {
                height: height - props.sneak!/2,
                width: width,
            },
            scrollview: {
                paddingVertical: props.sneak!/4,
            }
        });
    } else {
        computedStyles = StyleSheet.create({
            content: {
                height: height,
                width: width - props.sneak!/2,
            },
            scrollview: {
                paddingHorizontal: props.sneak!/4,
            }
        })
    }


    let body: any = null;
    const children = Array.isArray(props.children) ? props.children : [props.children]
    body = children.map((child, index) => {
        return (
            <TouchableWithoutFeedback
                key={index}
                onPress={() => { setCurrentPage(index); }}
                style={[{ flex: 1, overflow: 'hidden' }]}
            >
                <View
                    style={[{ flexGrow: 1, overflow: 'hidden', }, computedStyles.content, props.pageStyle]}
                >
                    {child}
                </View>
            </TouchableWithoutFeedback>
        );
    });

    return (
        <View style={{ flex: 1, }}>
            <ScrollView bounces={false} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} overScrollMode={"never"} contentContainerStyle={[computedStyles.scrollview, props.containerStyle]} onLayout={OnLayout} horizontal={!props.vertical} snapToInterval={snapInterval} ref={scrollview} scrollEnabled={!props.disabled}>
                {body}
            </ScrollView>
        </View>
    );
}

Carousel.defaultProps = {
    initialPage: 0,
    sneak: 20,
    vertical: false,
    disabled: false,
}

export default Carousel;
