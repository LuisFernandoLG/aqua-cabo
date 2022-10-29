import { Marker } from "react-native-maps";

export const TruckMarker = ({
  id,
  latitude,
  longitude,
  title,
  description,
  image,
}) => {
  return (
    <Marker
      key={id}
      coordinate={{ latitude, longitude }}
      title={title || "titulo"}
      description={description || "any description"}
      image={image || require("../../assets/bus.png")}
    />
  );
};
