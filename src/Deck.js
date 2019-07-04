//SECTION Imports
import React, { Component } from 'react';
import {
  Animated,
  Dimensions,
  LayoutAnimation,
  PanResponder,
  StyleSheet,
  UIManager,
  View
} from 'react-native';
//!SECTION
//SECTION Constants/Initial Values
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SWIPE_THRESHOLD = 0.5 * SCREEN_WIDTH;
const FORCE_SWIPE_DURATION = 250;
const UPPER_RIGHT = { x: SCREEN_WIDTH, y: 0 };
const LOWER_LEFT = { x: -SCREEN_WIDTH, y: SCREEN_HEIGHT };
export default class Deck extends Component {
  static defaultProps = {
    onSwipeLeft: () => {},
    onSwipeRight: () => {},
    renderNoMoreCards: () => {}
  };
  constructor(props) {
    super(props);
    //ANCHOR original values
    const position = new Animated.ValueXY();
    const scale = new Animated.Value(1);
    //!SECTION
    //SECTION PanResponder
    const panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gesture) => {
        this.increaseCardSize();
      },
      onPanResponderMove: (evt, { dx: x, dy: y }) => {
        position.setValue({ x, y });
      },
      onPanResponderRelease: (evt, { dx: x, dy: y }) => {
        if (x > SWIPE_THRESHOLD) {
          this.forceSwipe(x);
        } else if (x < -SWIPE_THRESHOLD) {
          this.forceSwipe(x);
        } else {
          this.resetCardToOriginAndSize();
        }
      },
      onStartShouldSetPanResponder: () => true
    });
    //!SECTION
    //ANCHOR state
    this.state = {
      currentCard_index: 0,
      panResponder,
      position,
      scale
    };
  }

  shouldComponentUpdate() {
    UIManager.setLayoutAnimationEnabledExperimental &&
      UIManager.setLayoutAnimationEnabledExperimental(true);
    LayoutAnimation.spring();
    return true;
  }

  //SECTION Sizing/Positioning
  increaseCardSize = () => {
    Animated.spring(this.state.scale, {
      toValue: 1.05
    }).start();
  };

  moveAndRotateCard = () => {
    const { position } = this.state;
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.5, 0, 1.5 * SCREEN_WIDTH],
      outputRange: ['-120deg', '0deg', '120deg']
    });
    return {
      ...position.getLayout(),
      transform: [{ rotate }]
    };
  };

  scaleCard = () => {
    return {
      transform: [{ scale: this.state.scale }]
    };
  };

  forceSwipe = positionX => {
    if (positionX > 0) {
      this.moveOffScreen(UPPER_RIGHT);
    } else if (positionX < 0) {
      this.moveOffScreen(LOWER_LEFT);
    }
  };

  moveOffScreen = direction => {
    Animated.timing(
      this.state.position,
      {
        toValue: direction
      },
      FORCE_SWIPE_DURATION
    ).start(() => {
      this.onSwipeComplete(direction);
    });
    this.resetCardScale();
  };
  //!SECTION
  //SECTION Clean-up Methods
  resetPositionXY = () => {
    Animated.spring(this.state.position, {
      toValue: {
        x: 0,
        y: 0
      }
    }).start();
  };

  resetCardScale = () => {
    Animated.spring(this.state.scale, {
      toValue: 1
    }).start();
  };

  resetCardToOriginAndSize = () => {
    this.resetPositionXY();
    this.resetCardScale();
  };

  onSwipeComplete = direction => {
    const { cards, onSwipeLeft, onSwipeRight } = this.props;
    const item = cards[this.state.currentCard_index];
    direction.x > 0 ? onSwipeRight(item) : onSwipeLeft(item);
    this.state.position.setValue({ x: 0, y: 0 });
    this.setState(() => {
      return {
        currentCard_index: this.state.currentCard_index + 1
      };
    });
  };
  //!SECTION
  //ANCHOR Render Cards
  renderCards = () => {
    const lastCard = (
      <Animated.View key="last-card" style={{ zIndex: -1 }}>
        {this.props.renderNoMoreCards()}
      </Animated.View>
    );
    const { currentCard_index } = this.state;
    const topCards = this.props.cards.map((card, cardToRender_index) => {
      if (cardToRender_index < currentCard_index) {
        return null;
      } else if (cardToRender_index === currentCard_index) {
        return (
          <Animated.View
            data-index={cardToRender_index}
            key={card.id}
            style={[
              this.moveAndRotateCard(),
              {
                transform: [
                  { ...this.moveAndRotateCard().transform[0] },
                  { ...this.scaleCard().transform[0] }
                ]
              },
              {
                ...styles.cardStyle,
                zIndex: this.props.cards.length - cardToRender_index
              },
              { ...this.state.position.getLayout() }
            ]}
            {...this.state.panResponder.panHandlers}
          >
            {this.props.renderCard(card)}
          </Animated.View>
        );
      } else {
        return (
          <Animated.View
            key={card.id}
            style={{
              ...styles.cardStyle,
              zIndex: this.props.cards.length - cardToRender_index,
              top: 10 * (cardToRender_index - this.state.currentCard_index)
            }}
          >
            {this.props.renderCard(card)}
          </Animated.View>
        );
      }
    });
    topCards.push(lastCard);
    return topCards;
  };
  //<==

  render() {
    return <View>{this.renderCards()}</View>;
  }
}

const styles = StyleSheet.create({
  cardStyle: {
    position: 'absolute',
    width: '100%'
  }
});
