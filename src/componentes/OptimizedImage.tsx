import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ImageProps,
    ImageSourcePropType,
    StyleSheet,
    View
} from 'react-native';

interface OptimizedImageProps extends Omit<ImageProps, 'source'> {
  source: ImageSourcePropType;
  showLoader?: boolean;
  showFallback?: boolean;
  loaderColor?: string;
  fallbackIconName?: keyof typeof Ionicons.glyphMap;
  fallbackIconColor?: string;
  fallbackIconSize?: number;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  style,
  showLoader = true,
  showFallback = true,
  loaderColor = '#1e6a43',
  fallbackIconName = 'image-outline',
  fallbackIconColor = '#ccc',
  fallbackIconSize = 24,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const imageStyle = Array.isArray(style) ? style : [style];

  return (
    <View style={[styles.container, ...imageStyle]}>
      {!hasError && (
        <Image
          source={source}
          style={[styles.image, ...imageStyle]}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          {...props}
        />
      )}
      
      {/* Loader durante o carregamento */}
      {isLoading && showLoader && !hasError && (
        <View style={styles.overlay}>
          <ActivityIndicator size="small" color={loaderColor} />
        </View>
      )}
      
      {/* Fallback em caso de erro */}
      {hasError && showFallback && (
        <View style={[styles.overlay, styles.fallbackContainer]}>
          <Ionicons 
            name={fallbackIconName} 
            size={fallbackIconSize} 
            color={fallbackIconColor} 
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(240, 240, 240, 0.8)',
  },
  fallbackContainer: {
    backgroundColor: '#f5f5f5',
  },
});

export default OptimizedImage;

