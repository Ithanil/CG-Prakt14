/**
 * Tangentvectors of contactpoint: U W N

 * Unitvectors of contactpoint: Ucirc Wcirc Ncirc /circ for circonflex
 * Proximity: proximU, proximW, proximN
 * Stiffness (Härte/Steifheit): ksum ktangent knormal
 * Energies: EU EW EN
 * Ratios EU/EW to EN: EnergyratioU EnergyratioW
 * Sign of DeltaU, DeltaW: alpha beta
 * Ratios of stiffness to tangent stiffness: eta
 * Timestep dt
 * sum of momentum: impSum
 * Object velocity: velocity
 * Point velocity: velU velW velN
 * Mass: mass
**/

dt=0.001;

proximU = 0.1;
proximW = 0.1;
proximN = 0.1;

ksum = 0.5;
ktangent = 0.3;

eta = Sqrt(ksum/ktangent);

	if(velU < 0)
		{
		alpha = -1;
		}
		else
		{
		alpha = 1;
		}
		
	if(velW < 0)
		{
		beta = -1;
		}
		else
		{
		beta = 1;
		}

EU = proximU*proximU*ktangent*/2;
EW = proximW*proximW*ktangent*/2;
EN = proximN*proximN*knormal*/2;

EnergyratioU = - Sqrt(EU/EN) * alpha / eta;

EnergyratioW = - Sqrt(EW/EN) * beta / eta;

impSum = impSum + dt * (Ucirc * EnergyratioU + Wcirc * EnergyratioW + Ncirc);

/////////////übergebe Impultze////////////////

velocity = velocity0 + impSum / mass;

omega = omega0 - bla
