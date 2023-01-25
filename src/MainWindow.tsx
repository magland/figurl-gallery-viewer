import { Grid } from "@mui/material";
import { FunctionComponent, useMemo } from "react";
import ExampleCard from "./ExampleCard";
import useGallery from "./useGallery";

type Props ={
}

const MainWindow: FunctionComponent<Props> = () => {
	const {examples} = useGallery()
	console.log('--- examples', examples)
	const categories = useMemo(() => (
		[...new Set(examples.map(e => (e.category)))].sort()
	), [examples])
	return (
		<div>
			<h1>Figurl gallery</h1>
			{
				categories.map(category => (
					<div style={{paddingBottom: 30}}>
						<h2>{category}</h2>
						<Grid container spacing={3}>
							{
								examples.filter(e => (e.category === category)).map(e => (
									<Grid key={e.title} item><ExampleCard example={e} /></Grid>
								))
							}
						</Grid>
					</div>
				))
			}
		</div>
	)
}

export default MainWindow
