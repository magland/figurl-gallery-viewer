import { Grid } from "@mui/material";
import { FunctionComponent, useMemo } from "react";
import ExampleCard from "./ExampleCard";
import useGallery from "./useGallery";

type Props ={
}

const fixedCategories = [
	{category: 'general', title: 'General'},
	{category: 'spike_sorting', title: 'Spike sorting'},
	{category: 'frank_lab', title: 'Frank lab'},
	{category: 'sanes_lab', title: 'Sanes lab'}
]

const MainWindow: FunctionComponent<Props> = () => {
	const {examples} = useGallery()
	console.info('Examples:', examples)
	const categories = useMemo(() => (
		[...new Set(examples.map(e => (e.category)))].sort().sort((c1, c2) => {
			const i1 = fixedCategories.map(c => (c.category)).indexOf(c1)
			const i2 = fixedCategories.map(c => (c.category)).indexOf(c2)
			if ((i1 >= 0) && (i2 >= 0)) {
				return i1 - i2
			}
			else return 0
		})
	), [examples])
	const titleForCategory = useMemo(() => ((category: string) => {
		return fixedCategories.filter(c => (c.category === category))[0]?.title || category
	}), [])

	return (
		<div>
			<h1>Figurl gallery</h1>
			{
				categories.map(category => (
					<div key={category} style={{paddingBottom: 30}}>
						<h2>{titleForCategory(category)}</h2>
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
