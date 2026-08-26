import { fireEvent, render } from '@testing-library/react-native';
import type { MatchDetails } from '../../types';
import AiAnalysisCard from '../match-details/AiAnalysisCard';
import MatchDetailsTabs from '../match-details/MatchDetailsTabs';

jest.mock('../match-details/AiAnalysisCard', () => jest.fn(() => null));
jest.mock('../match-details/PredictionRank', () => jest.fn(() => null));

const match = { id: 42, predictions: [] } as unknown as MatchDetails;

describe('MatchDetailsTabs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('mounts the AI tab only after the user selects it', () => {
    const { getByLabelText, getByTestId } = render(<MatchDetailsTabs match={match} />);

    fireEvent(getByTestId('match-details-tabs'), 'layout', {
      nativeEvent: { layout: { width: 360 } },
    });
    expect(AiAnalysisCard).not.toHaveBeenCalled();

    fireEvent.press(getByLabelText('AI Analysis'));

    expect(AiAnalysisCard).toHaveBeenCalled();
  });

  it('mounts the AI tab when the user swipes to it', () => {
    const { getByTestId } = render(<MatchDetailsTabs match={match} />);

    fireEvent(getByTestId('match-details-tabs'), 'layout', {
      nativeEvent: { layout: { width: 360 } },
    });
    expect(AiAnalysisCard).not.toHaveBeenCalled();

    fireEvent(getByTestId('match-details-pages'), 'viewableItemsChanged', {
      viewableItems: [{ index: 1 }],
    });

    expect(AiAnalysisCard).toHaveBeenCalled();
  });
});
