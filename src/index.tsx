"use strict";

import React, { Component, ReactNode } from "react";
import PropTypes from 'prop-types';
import {
    Dimensions,
    I18nManager,
    ScrollView,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View,
    NativeSyntheticEvent,
    NativeScrollEvent
} from "react-native";

import styles from "./styles";

const { width } = Dimensions.get("window");

type CarouselProps = {
    pageStyle?: object,
    containerStyle?: object,
    onPageChange?(position: number, currentElement: ReactNode): void,
} & Partial<CarouselDefaultProps>;

type CarouselDefaultProps = {
    initialPage?: number | 'center',
    pageWidth?: number,
    sneak?: number,
    noItemsText?: string,
    transitionDelay?: number,
    currentPage?: number,
    swipeThreshold?: number
};

type CarouselStates = {
    gap: number,
    currentPage: number,
}

export default class Carousel extends Component<CarouselProps, CarouselStates> {

    displayName = "Carousel";
    scrollView: ScrollView | null = null;

    /*static propTypes = {
        pageStyle: PropTypes.object,
        pageWidth: PropTypes.number,
        children: PropTypes.oneOfType([ PropTypes.arrayOf(PropTypes.node), PropTypes.node ]).isRequired,
        initialPage: PropTypes.number,
        containerStyle: PropTypes.object,
        noItemsText: PropTypes.string,
        onPageChange: PropTypes.func,
        sneak: PropTypes.number,
        transitionDelay: PropTypes.number,
        currentPage: PropTypes.number,
        swipeThreshold: PropTypes.number
    };*/

    static defaultProps = {
        initialPage: 0,
        pageWidth: width - 80,
        sneak: 20,
        noItemsText: "Sorry, there are currently \n no items available",
        transitionDelay: 0,
        currentPage: 0,
        swipeThreshold: 0.5,
    } as Partial<CarouselDefaultProps>;

    constructor(props: CarouselProps) {
        super(props);

        var initialPage: number;

        if (props.initialPage == 'center') {
            initialPage = Math.floor((this._getPagesCount() - 1) / 2)
        } else {
            initialPage = props.initialPage as number;
        }

        this.state = {
            gap: 0,
            currentPage: initialPage,
        };

        //this._scrollTimeout = null;

        this._resetScrollPosition = this._resetScrollPosition.bind(this);
        this._handleScrollEnd = this._handleScrollEnd.bind(this);
    }

    /*UNSAFE_componentWillMount() {
        this._calculateGap(this.props);
    }*/

    componentDidMount() {
        this._calculateGap(this.props);
        this._resetScrollPosition(false);
    }

    /*static getDerivedStateFromProps(nextProps, prevState) {
        return {
            currentPage: nextProps.currentPage,
            prevPage: prevState.currentPage,
        };
    }*/

    /*UNSAFE_componentWillReceiveProps(nextProps) {
        
        this.setState({
            currentPage: nextProps.currentPage
        });
        
        //this._calculateGap(nextProps);
    }*/

    componentDidUpdate(prevProps: CarouselProps, prevState: CarouselStates) {
        /*if (prevProps !== this.props) {
            this._calculateGap(prevProps);
        }*/
        if (prevProps.currentPage !== this.props.currentPage) {
            this._resetScrollPosition();
            this._onPageChange(this.props.currentPage!);
        } else if (prevState.currentPage !== this.state.currentPage) {
            this._resetScrollPosition();
            this._onPageChange(this.state.currentPage);
        }
    }

    /*componentWillUnmount() {
        if (this._scrollTimeout) {
            clearTimeout(this._scrollTimeout);
        }
    }*/

    _getPageOffset() {
        const {
            pageWidth,
        } = this.props;

        const {
            gap,
        } = this.state;

        return pageWidth! + gap;
    }

    _getPageScrollX(pageIndex: number) {
        return pageIndex * this._getPageOffset();
    }

    _getPagesCount() {
        return React.Children.count(this.props.children);
    }

    _resetScrollPosition(animated = true) {
        // in android, you can't scroll directly in componentDidMount
        // (http://stackoverflow.com/questions/33208477/react-native-android-scrollview-scrollto-not-working)
        // however this doesn't work in android for some reason:
        // InteractionManager.runAfterInteractions(() => {
        //     this.scrollView.scrollTo({ y: 0, x: pagePosition}, true);
        //     console.log('scrollView.scrollTo x:', pagePosition);
        // });
        // So I was left with an arbitrary timeout.
        /*if (this._scrollTimeout) {
            clearTimeout(this._scrollTimeout);
        }*/
        /*this._scrollTimeout = setTimeout(() => {
            this.scrollView.scrollTo({
                x: this._getPageScrollX(this.state.currentPage),
                y: 0,
                animated,
            });
            this._scrollTimeout = null;
        }, this.props.transitionDelay);*/
        if (this.scrollView) {
            this.scrollView.scrollTo({
                x: this._getPageScrollX(this.state.currentPage),
                y: 0,
                animated,
            });
        }
    }

    _calculateGap(props: CarouselProps) {
        const { sneak, pageWidth } = props;
        if (pageWidth! > width) {
            throw new Error("invalid pageWidth");
        }
        /*
         ------------
        |            |
        |-   ----   -|
        | | |    | | |
        | | |    | | |
        | | |    | | |
        |-   ----   -|
        |^-- sneak   |
        |         ^--- gap
         ------------

        */
        const gap = (width - (2 * sneak!) - pageWidth!) / 2;
        this.setState({ gap: gap });
    }

    _handleScrollEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
        const { swipeThreshold } = this.props;
        const { currentPage } = this.state;

        const currentPageScrollX = this._getPageScrollX(currentPage);
        const currentScrollX = e.nativeEvent.contentOffset.x;

        const swiped = (currentScrollX - currentPageScrollX) / this._getPageOffset();

        const pagesSwiped = Math.floor(Math.abs(swiped) + (1 - swipeThreshold!)) * Math.sign(swiped);
        const newPage = Math.max(Math.min(currentPage + pagesSwiped, this._getPagesCount() - 1), 0)

        if (newPage !== currentPage) {
            this.setState({ currentPage: newPage });
        } else {
            this._resetScrollPosition();
        }

    };

    _onPageChange(position: number) {
        if (this.props.onPageChange) {
            var children = this.props.children
            if (children) {
                const currentElement = children;
                this.props.onPageChange(position, currentElement);
            }
        }
    }

    render() {
        const { sneak, pageWidth } = this.props;
        const { gap } = this.state;
        const computedStyles = StyleSheet.create({
            scrollView: {
                paddingLeft: sneak! + gap / 2,
                paddingRight: sneak! + gap / 2
            },
            page: {
                width: pageWidth,
                justifyContent: "center",
                marginLeft: gap / 2,
                marginRight: gap / 2
            }
        });

        // if no children render a no items dummy page without callbacks
        let body = null;
        if (!this.props.children) {
            body = (
                <TouchableWithoutFeedback>
                    <View style={[styles.page, computedStyles.page, this.props.pageStyle]}>
                        <Text style={styles.noItemsText}>
                            {this.props.noItemsText}
                        </Text>
                    </View>
                </TouchableWithoutFeedback>
            );
        }
        else {
            const children = Array.isArray(this.props.children) ? this.props.children : [this.props.children]
            body = children.map((c, index) => {
                return (
                    <TouchableWithoutFeedback
                        key={index}
                        onPress={() => this.setState({ currentPage: index })}
                    >
                        <View
                            style={[styles.page, computedStyles.page, this.props.pageStyle]}
                        >
                            {c}
                        </View>
                    </TouchableWithoutFeedback>
                );
            });
        }

        return (
            <View style={[styles.container, this.props.containerStyle]}>
                <ScrollView
                    automaticallyAdjustContentInsets={false}
                    bounces
                    contentContainerStyle={[computedStyles.scrollView]}
                    style={{ flexDirection: (I18nManager && I18nManager.isRTL) ? 'row-reverse' : 'row' }}
                    decelerationRate={0.9}
                    horizontal
                    onScrollEndDrag={this._handleScrollEnd}
                    ref={c => this.scrollView = c}
                    showsHorizontalScrollIndicator={false}
                    onLayout={() => { this._resetScrollPosition(false); }}
                >
                    {body}
                </ScrollView>
            </View>
        );
    }
}
