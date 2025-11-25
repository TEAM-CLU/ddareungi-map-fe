import { Pressable, Text, View } from "react-native";
import { tw } from "@/shared/libs/tw-helper";
import { IconStar } from "../icons";
import React from "react";

interface BookmarkBadgeProps {
  name: string;
  alias?: string;
  color?: string;
  onPress: () => void;
}

const BookmarkBadge = ({
  name,
  alias,
  color = '#01DA86',
  onPress,
}: BookmarkBadgeProps) => {
  const displayName = alias && alias.trim().length > 0 ? alias : name;
  const trimmedName =
    displayName.length > 4 ? displayName.slice(0, 4) + '...' : displayName;

  return (
    <Pressable
      onPress={onPress}
      style={[
        tw('flex-row items-center bg-white rounded-full pl-2 pr-3 py-1'),
        {
          borderWidth: 1,
          borderColor: '#E5E7EB',
          marginRight: 8,
        },
      ]}
    >
      <View
        style={[
          tw('items-center justify-center rounded-full'),
          {
            width: 22,
            height: 22,
            backgroundColor: color,
          },
        ]}
      >
        <IconStar width={14} height={14} fillColor="white" strokeColor="#01DA86" />
      </View>

      <Text
        numberOfLines={1}
        style={tw('ml-2 font-primary-600 text-on-surface-primary')}
      >
        {trimmedName}
      </Text>
    </Pressable>
  );
};

export default React.memo(BookmarkBadge);
