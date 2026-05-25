import React from 'react';
import { Modal, View, Text, TouchableOpacity, Pressable } from 'react-native';
import { router } from 'expo-router';

type Props = {
  visible: boolean;
  onChooseLeague: () => void;
  onDismiss: () => void;
};

export const DowngradeModal = ({ visible, onChooseLeague, onDismiss }: Props) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
    <Pressable className="flex-1 bg-black/50 items-center justify-center px-6" onPress={onDismiss}>
      <Pressable className="bg-white rounded-2xl p-6 w-full max-w-sm" onPress={(e) => e.stopPropagation()}>
        <Text className="text-xl font-bold text-gray-900 mb-2">Your Pro plan has ended</Text>
        <Text className="text-sm text-gray-600 mb-6">
          Free users can keep 1 active league. Choose which league stays active, or upgrade to Pro to unlock all your leagues.
        </Text>
        <TouchableOpacity
          className="bg-blue-600 rounded-xl py-3 items-center mb-3"
          onPress={onChooseLeague}
          activeOpacity={0.8}
        >
          <Text className="text-white font-semibold">Choose active league</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="border border-blue-600 rounded-xl py-3 items-center"
          onPress={() => {
            onDismiss();
            router.push('/(app)/(public)/subscription');
          }}
          activeOpacity={0.8}
        >
          <Text className="text-blue-600 font-semibold">Upgrade to Pro</Text>
        </TouchableOpacity>
      </Pressable>
    </Pressable>
  </Modal>
);
