import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Card } from 'react-native-elements';
import Deck from './src/Deck';

export default class App extends Component {
  state = {
    cards: null,
    deckId: 0
  };

  componentDidMount = () => {
    this.fetchCards();
  };

  fetchCards = () => {
    fetch('https://deck-8989d.firebaseio.com/cards.json')
      .then(res => res.json())
      .then(cards => {
        this.setState(() => ({
          cards,
          deckId: this.state.deckId + 1
        }));
      })
      .catch(err => {
        console.log('Image not available');
      });
  };

  renderCard = card => {
    return (
      <Card image={{ uri: card.uri }} title={card.text}>
        <Text style={{ marginBottom: 10 }}>
          I can customize the Card further.
        </Text>
        <Button
          backgroundColor="#03A9F4"
          icon={{ name: 'code' }}
          title="View Now"
        />
      </Card>
    );
  };

  handleGetMoreCards = () => {
    this.fetchCards();
  };

  renderNoMoreCards = () => {
    return (
      <Card
        image={{
          uri: 'https://bit.ly/2YEkBNi'
        }}
        title="No More Cards"
      >
        <Button
          backgroundColor="#03A9F4"
          onPress={this.handleGetMoreCards}
          title="Get More"
        />
      </Card>
    );
  };

  render() {
    return (
      <View style={styles.container}>
        {this.state.cards && (
          <Deck
            cards={this.state.cards}
            key={this.state.deckId}
            renderCard={this.renderCard}
            renderNoMoreCards={this.renderNoMoreCards}
          />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1
  }
});
