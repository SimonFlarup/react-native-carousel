# React Native Scrollview Carousel

React Native Carousel with support for both iOS and Android.

## Installation

```
npm install react-native-scrollview-carousel --save
```

## Usage

```
import Carousel from "react-native-scrollview-carousel";
//...
<Carousel>
    <Text>Hello</Text>
    <Text>World!</Text>
    <Text>From carousel</Text>
</Carousel>
```

### pageStyle

Type: `PropTypes.object`

The style that will be applied on the page. For example:

```
<Carousel pageStyle={ {backgroundColor: "white", borderRadius: 5} }>
```

### initialPage

Type: `PropTypes.number`

The index of the initial page. The first page is `0`.

### onPageChange
! TBA !

Type: `PropTypes.func`

This function will be called every time the page changes.

### sneak

Type: `PropTypes.number`

How much of the adjacent pages will display.

## License

The MIT License (MIT)

Copyright (c) 2020 Simon Holland Flarup <mail@simonflarup.dk>.