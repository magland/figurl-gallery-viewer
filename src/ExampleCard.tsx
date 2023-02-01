import { Button, Card, CardActionArea, CardActions, CardContent, CardMedia, Typography } from "@mui/material";
import { FunctionComponent, useCallback } from "react";
import { GalleryExample } from "./useGallery";

type Props = {
	example: GalleryExample
}

const ExampleCard: FunctionComponent<Props> = ({ example }) => {
	const handleLearnMore = useCallback(() => {
		window.open(example.url, '_blank')
	}, [])
	return (
		<Card sx={{ maxWidth: 300 }}>
			<CardActionArea onClick={handleLearnMore}>
				<CardMedia
					sx={{ height: 200 }}
					image={example.image}
					title={example.title}
				/>
			<CardContent>
				<Typography gutterBottom variant="h5" component="div">
					{example.title}
				</Typography>
				<Typography variant="body2" color="text.secondary">
					{example.description}
				</Typography>
			</CardContent>
			</CardActionArea>
			<CardActions>
				<Button disabled={!example.url} onClick={handleLearnMore} size="small">Learn More</Button>
			</CardActions>
		</Card>
	)
}

export default ExampleCard
