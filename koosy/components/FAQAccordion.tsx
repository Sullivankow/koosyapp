import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

export type FAQItem = {
  question: string;
  answer: string;
};

interface FAQAccordionProps {
  data: FAQItem[];
  colors: { primary: string; text: string; surface: string };
}

const FAQAccordion: React.FC<FAQAccordionProps> = ({ data, colors }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <View>
      {data.map((item, idx) => (
        <View key={idx} style={styles.item}>
          <TouchableOpacity
            style={[styles.questionRow, { backgroundColor: colors.surface }]}
            onPress={() => toggle(idx)}
            activeOpacity={0.7}
          >
            <Text style={[styles.question, { color: colors.primary }]}>{item.question}</Text>
            <FontAwesome5
              name={openIndex === idx ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.primary}
            />
          </TouchableOpacity>
          {openIndex === idx && (
            <Text style={[styles.answer, { color: colors.text }]}>{item.answer}</Text>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  question: {
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1,
    marginRight: 10,
  },
  answer: {
    padding: 14,
    paddingTop: 0,
    fontSize: 15,
    backgroundColor: 'transparent',
  },
});

export default FAQAccordion;