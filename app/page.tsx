import { getExperiences, getExperienceStats } from './actions/experiences'
import { getCountries } from './actions/countries'
import MainView from './components/MainView'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const experiences = await getExperiences()
  const stats = await getExperienceStats()
  const countries = await getCountries()

  return (
    <MainView 
      initialExperiences={experiences} 
      initialStats={stats}
      initialCountries={countries}
    />
  )
}
