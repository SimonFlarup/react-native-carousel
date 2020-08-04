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
    vertical?: boolean
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
        console.log("position: " + position + " | CurrentPage: " + currentPage + " | SnapInterval " + snapInterval);
    }

    const OnLayout = (event: LayoutChangeEvent) => {
        const layout = event.nativeEvent.layout;

        setHeight(layout.height);
        setWidth(layout.width);

        if (props.vertical) {
            setSnapInterval(layout.height - props.sneak! * 2);
        } else {
            setSnapInterval(layout.width - props.sneak! * 2);
        }

        console.log("Height: " + layout.height + " | Width: " + layout.width);
    }

    let computedStyles: any = null;

    if (props.vertical) {
        computedStyles = StyleSheet.create({
            content: {
                height: height,
                width: width,
                paddingVertical: props.sneak!,
                marginVertical: -props.sneak!,
            },
            scrollview: {
                paddingVertical: props.sneak!,
            }
        });
    } else {
        computedStyles = StyleSheet.create({
            content: {
                height: height,
                width: width,
                paddingHorizontal: props.sneak!,
                marginHorizontal: -props.sneak!,
            },
            scrollview: {
                paddingHorizontal: props.sneak!,
            }
        })
    }


    let body: any = null;
    const children = Array.isArray(props.children) ? props.children : [props.children]
    body = children.map((child, index) => {
        return (
            <TouchableWithoutFeedback
                key={index}
                onPress={() => { console.log("Setting current page: " + index); setCurrentPage(index); }}
                style={[{ flex: 1, overflow: 'hidden' }]}
            >
                <View
                    style={[{ flexGrow: 1, overflow: 'hidden' }, computedStyles.content, props.pageStyle]}
                >
                    {child}
                </View>
            </TouchableWithoutFeedback>
        );
    });

    return (
        <View style={{ flex: 1, }}>
            <ScrollView bounces={false} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} overScrollMode={"never"} contentContainerStyle={[computedStyles.scrollview, props.containerStyle]} onLayout={OnLayout} horizontal={!props.vertical} snapToInterval={snapInterval} ref={scrollview}>
                {body}
            </ScrollView>
        </View>
    );
}

Carousel.defaultProps = {
    initialPage: 0,
    sneak: 20,
    vertical: false,
}

export default Carousel;
